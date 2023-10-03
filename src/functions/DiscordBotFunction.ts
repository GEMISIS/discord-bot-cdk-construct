import {Context, Callback} from 'aws-lambda';
import {IDiscordEventRequest} from '../types';
import {getDiscordSecrets} from './utils/DiscordSecrets';
import {Lambda} from 'aws-sdk';
import {commandLambdaARN} from './constants/EnvironmentProps';
import {sign} from 'tweetnacl';

const lambda = new Lambda();

/**
 * Handles incoming events from the Discord bot.
 * @param {IDiscordEventRequest} event The incoming request to handle.
 * @param {Context} _context The context this request was called with.
 * @param {Callback} _callback A callback to handle the request.
 * @return {IDiscordEventResponse} Returns a response to send back to Discord.
 */
export async function handler(event: IDiscordEventRequest, _context: Context,
    _callback: Callback) {
  console.log(`Received event: ${JSON.stringify(event)}`);

  const verifyPromise = verifyEvent(event);

  if (event) {
    switch (event.jsonBody.type) {
      case 1:
        // Return pongs for pings
        if (await verifyPromise) {
          return {
            type: 1,
          };
        }
        break;
      case 2:
        // Invoke the lambda to respond to the deferred message.
        const lambdaPromise = lambda.invoke({
          FunctionName: commandLambdaARN,
          Payload: JSON.stringify({
            ...event,
            // Hacky workaround due to https://github.com/aws/jsii/issues/3468
            guildId: (event.jsonBody.data as any)?['guild_id'] : undefined,
            targetId: (event.jsonBody.data as any)?['target_id'] : undefined,
          }),
          InvocationType: 'Event',
        }).promise();

        // Call of the promises and ACK the interaction.
        // Note that all responses are deferred to meet Discord's 3 second
        // response time requirement.
        if (await Promise.all([verifyPromise, lambdaPromise])) {
          return {
            type: 5,
          };
        }
        break;
    }
  }

  throw new Error('[UNAUTHORIZED] invalid request signature');
}

/**
 * Verifies that an event coming from Discord is legitimate.
 * @param {IDiscordEventRequest} event The event to verify from Discord.
 * @return {boolean} Returns true if the event was verified, false otherwise.
 */
export async function verifyEvent(event: IDiscordEventRequest): Promise<boolean> {
  try {
    const discordSecrets = await getDiscordSecrets();
    const isVerified = sign.detached.verify(
        Buffer.from(event.timestamp + JSON.stringify(event.jsonBody)),
        Buffer.from(event.signature, 'hex'),
        Buffer.from(discordSecrets?.publicKey ?? '', 'hex'),
    );
    return isVerified;
  } catch (exception) {
    console.log(exception);
    return false;
  }
}
