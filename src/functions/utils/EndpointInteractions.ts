import axios from 'axios';
import { IDiscordEndpointInfo, IDiscordResponseData } from '../../types';

/**
 * Send a followup message to Discord's APIs on behalf of the bot.
 * 
 * @param endpointInfo The information to use when talking to the endpoint.
 * @param interactionToken The token representing the interaction to follow up on.
 * @param responseData The response data to be sent to the Discord server.
 * @returns Returns true if the response was succesfully sent, false otherwise.
 */
export async function sendFollowupMessage(endpointInfo: IDiscordEndpointInfo,
    interactionToken: string, responseData: IDiscordResponseData): Promise<boolean> {
  const { allowedMentions, ...strippedResponseData } = responseData;
  const authConfig = {
    headers: {
      'Authorization': `Bot ${endpointInfo.authToken}`
    }
  };
  const data = {
    ...strippedResponseData,
    allowed_mentions: allowedMentions
  };

  try {
    const url = `https://discord.com/api/v${endpointInfo.apiVersion ?? '8'}/webhooks/${endpointInfo.applicationId}/${interactionToken}`;
    return (await axios.post(url, data, authConfig)).status == 200;
  } catch (exception) {
    console.log(`There was an error posting a response: ${exception}`);
    return false;
  }
}
