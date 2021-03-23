const mockGetSecretValue = jest.fn().mockReturnValue({
  SecretString: JSON.stringify({
    appId: 'appId',
    publicKey: 'publicKey',
    clientId: 'clientId',
    authToken: 'authToken'
  })
});

const mockGetSecretValuePromise = {
  promise: mockGetSecretValue
}

const mockSecretsManager = {
  getSecretValue: jest.fn(() => mockGetSecretValuePromise)
}

jest.mock('aws-sdk', () => {
  return {
    SecretsManager: jest.fn(() => mockSecretsManager),
  };
});

import * as DiscordSecrets from '../../../src/functions/utils/DiscordSecrets';

describe('Test DiscordSecrets', () => {
  afterEach(() => {
    mockGetSecretValuePromise.promise.mockReset();
  });

  // Note that we need to test everything at once, otherwise the order
  // in which the tests are run can mess up caching.
  test('Test Get Secrets - All', async () => {
    // Test no SecretString first
    mockGetSecretValue.mockReturnValueOnce({});
    expect(await DiscordSecrets.getDiscordSecrets()).toEqual(undefined);
    expect(mockGetSecretValuePromise.promise).toBeCalledTimes(1);

    // Test an invalid SecretString next
    mockGetSecretValue.mockReturnValueOnce({
      SecretString: 'gibberish'
    });
    expect(await DiscordSecrets.getDiscordSecrets()).toEqual(undefined);
    expect(mockGetSecretValuePromise.promise).toBeCalledTimes(2);

    // Test a good case next.
    mockGetSecretValue.mockReturnValueOnce({
      SecretString: JSON.stringify({
        appId: 'appId',
        publicKey: 'publicKey',
        clientId: 'clientId',
        authToken: 'authToken'
      })
    });
    expect(await DiscordSecrets.getDiscordSecrets()).toEqual({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken'
    });
    expect(mockGetSecretValuePromise.promise).toBeCalledTimes(3);

    // Test caching finally
    expect(await DiscordSecrets.getDiscordSecrets()).toEqual({
      appId: 'appId',
      publicKey: 'publicKey',
      clientId: 'clientId',
      authToken: 'authToken'
    });
    expect(mockGetSecretValuePromise.promise).toBeCalledTimes(3);
  });
});