import axios, { AxiosRequestConfig } from 'axios';
import * as EndpointInteractions from '../../../src/functions/utils/EndpointInteractions';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Test EndpointInteractions', () => {
  const endpointInfo = {
    authToken: 'auth',
    applicationId: 'appid'
  };
  const token = 'token';
  const responseData = {
    content: 'testing',
    allowedMentions: [],
    embeds: [],
    tts: false
  };

  afterEach(() => {
    mockedAxios.post.mockReset();
  });

  test('Test successful followup', async () => {
    // Test default API version
    mockedAxios.post.mockResolvedValueOnce({
      status: 200
    });
    expect(await EndpointInteractions.sendFollowupMessage(endpointInfo, token, responseData)).toBeTruthy();
    expect(mockedAxios.post).toBeCalledTimes(1);
    expect(mockedAxios.post).toBeCalledWith(expect.stringContaining(`https://discord.com/api/v8/webhooks/appid/token`), expect.anything(), expect.anything())

    // Test API version 9 instead.
    mockedAxios.post.mockResolvedValueOnce({
      status: 200
    });
    expect(await EndpointInteractions.sendFollowupMessage({
      ...endpointInfo,
      apiVersion: '9'
    }, token, responseData)).toBeTruthy();
    expect(mockedAxios.post).toBeCalledTimes(2);
    expect(mockedAxios.post).toBeCalledWith(expect.stringContaining(`https://discord.com/api/v9/webhooks/appid/token`), expect.anything(), expect.anything())
  });

  test('Test unsuccessful followup', async () => {
    // Test the bad status code scenario.
    mockedAxios.post.mockResolvedValueOnce({
      status: 500
    });
    expect(await EndpointInteractions.sendFollowupMessage(endpointInfo, token, responseData)).toBeFalsy();
    expect(mockedAxios.post).toBeCalledTimes(1);
    expect(mockedAxios.post).toBeCalledWith(expect.stringContaining(`https://discord.com/api/v8/webhooks/appid/token`), expect.anything(), expect.anything())

    // Test the exception scenario.
    mockedAxios.post.mockImplementationOnce((_url: string, _data?: any, _config?: AxiosRequestConfig) => {
      throw new Error();
    });
    expect(await EndpointInteractions.sendFollowupMessage(endpointInfo, token, responseData)).toBeFalsy();
    expect(mockedAxios.post).toBeCalledTimes(2);
    expect(mockedAxios.post).toBeCalledWith(expect.stringContaining(`https://discord.com/api/v8/webhooks/appid/token`), expect.anything(), expect.anything())
  });
});
