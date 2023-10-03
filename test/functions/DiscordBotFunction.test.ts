import {Context, Callback} from 'aws-lambda';

const mockDiscordSecrets = jest.fn().mockReturnValue(Promise.resolve(undefined));

jest.mock('../../src/functions/utils/DiscordSecrets', () => {
  return {
    getDiscordSecrets: mockDiscordSecrets,
  };
});

const mockVerify = jest.fn();

jest.mock('tweetnacl', () => {
  return {
    sign: {
      detached: {
        verify: mockVerify,
      },
    },
  };
});

const mockInvoke = {
  promise: jest.fn(),
};
const mockLambda = {
  invoke: jest.fn(() => mockInvoke),
};

jest.mock('aws-sdk', () => {
  return {
    Lambda: jest.fn(() => mockLambda),
  };
});

import * as DiscordBot from '../../src/functions/DiscordBotFunction';
import {IDiscordEventRequest, IDiscordJsonBody} from '../../src/types';

describe('Test DiscordBot', () => {
  afterEach(() => {
    mockDiscordSecrets.mockReset();
    mockVerify.mockReset();
  });

  test('Test Handler - Default Command Success', async () => {
    mockDiscordSecrets.mockReturnValueOnce(Promise.resolve({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken',
    }));
    mockVerify.mockReturnValueOnce(true);
    const result = await DiscordBot.handler({
      timestamp: '',
      signature: '',
      jsonBody: {
        type: 2,
        version: 1,
      } as IDiscordJsonBody,
    } as IDiscordEventRequest, (null as unknown) as Context, (null as unknown) as Callback);

    expect(result).toEqual({
      type: 5,
    });
  });

  test('Test Handler - Ping', async () => {
    mockDiscordSecrets.mockReturnValueOnce(Promise.resolve({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken',
    }));
    mockVerify.mockReturnValueOnce(true);
    const result = await DiscordBot.handler({
      timestamp: '',
      signature: '',
      jsonBody: {
        type: 1,
        version: 1,
      },
    }, (null as unknown) as Context, (null as unknown) as Callback);

    expect(result).toEqual({
      type: 1,
    });
  });

  test('Test Handler - Error', async () => {
    mockDiscordSecrets.mockReturnValueOnce(Promise.resolve({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken',
    }));
    mockVerify.mockReturnValueOnce(false);
    expect(async () => {
      await DiscordBot.handler({
        timestamp: '',
        signature: '',
        jsonBody: {
          type: 255,
          version: 1,
        },
      }, (null as unknown) as Context, (null as unknown) as Callback);
    }).rejects.toThrow(Error);
  });

  test('Test Verify - Success', async () => {
    mockDiscordSecrets.mockReturnValueOnce(Promise.resolve({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken',
    }));
    mockVerify.mockReturnValueOnce(true);
    const result = await DiscordBot.verifyEvent({
      timestamp: '',
      signature: '',
      jsonBody: {
        type: 255,
        version: 1,
      },
    });

    expect(mockDiscordSecrets).toBeCalledTimes(1);
    expect(mockVerify).toBeCalledTimes(1);
    expect(result).toEqual(true);
  });

  test('Test Verify - Fail', async () => {
    mockDiscordSecrets.mockReturnValueOnce(Promise.resolve({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken',
    }));
    mockVerify.mockReturnValueOnce(false);
    const result = await DiscordBot.verifyEvent({
      timestamp: '',
      signature: '',
      jsonBody: {
        type: 255,
        version: 1,
      },
    });

    expect(mockDiscordSecrets).toBeCalledTimes(1);
    expect(mockVerify).toBeCalledTimes(1);
    expect(result).toEqual(false);
  });

  test('Test Verify - No Secret Key', async () => {
    mockDiscordSecrets.mockReturnValueOnce(undefined);
    mockVerify.mockReturnValueOnce(false);

    const result = await DiscordBot.verifyEvent({
      timestamp: '',
      signature: '',
      jsonBody: {
        type: 255,
        version: 1,
      },
    });

    expect(mockDiscordSecrets).toBeCalledTimes(1);
    expect(mockVerify).toBeCalledTimes(1);
    expect(result).toEqual(false);
  });

  test('Test Verify - nacl Exception', async () => {
    mockDiscordSecrets.mockReturnValueOnce(Promise.resolve({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken',
    }));
    mockVerify.mockImplementationOnce(() => {
      throw new Error('Handle errors');
    });

    const result = await DiscordBot.verifyEvent({
      timestamp: '',
      signature: '',
      jsonBody: {
        type: 255,
        version: 1,
      },
    });

    expect(mockDiscordSecrets).toBeCalledTimes(1);
    expect(mockVerify).toBeCalledTimes(1);
    expect(result).toEqual(false);
  });
});
