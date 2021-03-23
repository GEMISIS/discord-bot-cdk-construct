import {Context, Callback} from 'aws-lambda';
import {DiscordEventRequest, DiscordEventResponse} from '../types';
import {getDiscordSecrets} from './utils/DiscordSecrets';
import {Lambda} from 'aws-sdk';
import * as nacl from 'tweetnacl';
import {commandLambdaARN} from './constants/EnvironmentProps';

const lambda = new Lambda();

/**
 * Handles incoming events from the Discord bot.
 * @param {DiscordEventRequest} event The incoming request to handle.
 * @param {Context} context The context this request was called with.
 * @param {Callback} callback A callback to handle the request.
 * @return {DiscordEventResponse} Returns a response to send back to Discord.
 */
export async function handler(event: DiscordEventRequest, context: Context,
    callback: Callback): Promise<DiscordEventResponse> {
  console.log(`Received event: ${JSON.stringify(event)}`);

  if (event && await verifyEvent(event)) {
    switch (event.jsonBody.type) {
      case 1:
        return {
          type: 1,
        };
      case 2:
        console.log('Invoking command lambda...');
        await lambda.invoke({
          FunctionName: commandLambdaARN,
          Payload: JSON.stringify(event),
          InvocationType: 'Event',
        }).promise();
        console.log('Returning intermediate response...');
        return {
          type: 5,
        };
      default:
        return {
          type: 4,
          data: {
            tts: false,
            content: 'beep boop - I\'m still learning how to respond to that command.',
            embeds: [],
            allowed_mentions: [],
          },
        };
    }
  }

  throw new Error('[UNAUTHORIZED] invalid request signature');
}

/**
 * Verifies that an event coming from Discord is legitimate.
 * @param {DiscordEventRequest} event The event to verify from Discord.
 * @return {boolean} Returns true if the event was verified, false otherwise.
 */
export async function verifyEvent(event: DiscordEventRequest): Promise<boolean> {
  try {
    console.log('Getting Discord secrets...');
    const discordSecrets = await getDiscordSecrets();
    console.log('Verifying incoming event...');
    const isVerified = nacl.sign.detached.verify(
        Buffer.from(event.timestamp + JSON.stringify(event.jsonBody)),
        Buffer.from(event.signature, 'hex'),
        Buffer.from(discordSecrets?.publicKey ?? '', 'hex'),
    );
    console.log('Returning verification results...');
    return isVerified;
  } catch (exception) {
    console.log(exception);
    return false;
  }
}
