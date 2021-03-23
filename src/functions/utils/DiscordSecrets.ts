import { SecretsManager } from "aws-sdk";
import { DiscordSecrets } from "../../types";
import { discordBotAPIKeyName } from "../constants/EnvironmentProps";

const secretsManager = new SecretsManager();

/**
 * Cached Discord secrets so we can reduce warm start times.
 */
let __discordSecrets: DiscordSecrets | undefined = undefined;

/**
 * Gets the Discord secrets (public key, client ID, etc.) for use in our lambdas.
 * 
 * @returns {DiscordSecrets | undefined} The Discord secrets to be used.
 */
export async function getDiscordSecrets(): Promise<DiscordSecrets | undefined> {
  if (!__discordSecrets) {
    try {
      const discordApiKeys = await secretsManager.getSecretValue({
        SecretId: discordBotAPIKeyName,
      }).promise();
      if (discordApiKeys.SecretString) {
        __discordSecrets = JSON.parse(discordApiKeys.SecretString);
      }
    } catch (exception) {
      console.log(`Unable to get Discord secrets: ${exception}`);
    }
  }
  return __discordSecrets;
};