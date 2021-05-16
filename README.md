# discord-bot-cdk-construct

![Version Badge](https://img.shields.io/github/package-json/v/GEMISIS/discord-bot-cdk-construct?color=blue&logo=Discord) [![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

A CDK Construct for creating a serverless Discord bot. All you need to do is supply your code to handle the commands!

# Architecture Overview
This is the architecture for how this project is laid out server-side. The tools used to create these diagrams are:
- [Architecture Diagrams](https://app.diagrams.net)

The bot has a fairly straightforward setup:

![The architecture diagram for the project.](https://github.com/GEMISIS/discord-bot-cdk-construct/blob/main/diagrams/architecture.png?raw=true)

The biggest confusion likely stems from the use of two Lambda functions instead of one. This is to ensure that the initial request can respond within Discord's 3 second time limit and return a proper response to the user.

# Sample Usage
The usage is split into two parts: The [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) stack that will be used, and a "commands" script that actually handles responding. It's recommended that you are familiar with CDK first before diving into using this.

## Handling Commands
For handling commands, you just need to provide a Lambda function for sending response to Discord's Web APIs. As an example of how this can be done:
```typescript
import axios from 'axios';
import {Context, Callback} from 'aws-lambda';
import { DiscordEventRequest, DiscordResponseData, getDiscordSecrets} from 'discord-bot-cdk-construct';

export async function handler(event: DiscordEventRequest, context: Context,
  callback: Callback): Promise<string> {
  const response = {
    tts: false,
    content: 'Hello world!',
    embeds: [],
    allowed_mentions: [],
  };
  if (event.jsonBody.token && await sendResponse(response, event.jsonBody.token)) {
    console.log('Responded successfully!');
  } else {
    console.log('Failed to send response!');
  }
  return '200';
}

async function sendResponse(response: DiscordResponseData,
  interactionToken: string): Promise<boolean> {
  const discordSecret = await getDiscordSecrets();
  const authConfig = {
    headers: {
      'Authorization': `Bot ${discordSecret?.authToken}`
    }
  };

  try {
    let url = `https://discord.com/api/v8/webhooks/${discordSecret?.clientId}/${interactionToken}`;
    return (await axios.post(url, response, authConfig)).status == 200;
  } catch (exception) {
    console.log(`There was an error posting a response: ${exception}`);
    return false;
  }
}
```

## Using the Construct
To create a stack to make use of the above script, you can create a stack like so:

```typescript
import {Runtime} from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Construct, Duration, Stack} from '@aws-cdk/core';
import * as path from 'path';
import {DiscordBotConstruct} from 'discord-bot-cdk-construct';

/**
 * Creates the APIs and code behind them for managing various
 * things in the backend of the Oculus Start bot (user authorization, event
 * management, etc.)
 */
export class SampleDiscordBotStack extends Stack {
  /**
   * The constructor for building the stack.
   * @param {Construct} scope The Construct scope to create the stack in.
   * @param {string} id The ID of the stack to use.
   */
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the Lambdas next.
    const discordCommandsLambda = new NodejsFunction(this, 'discord-commands-lambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '../functions/DiscordCommands.ts'),
      handler: 'handler',
      timeout: Duration.seconds(60),
    });

    const discordBot = new DiscordBotConstruct(this, 'discord-bot-endpoint', {
      commandsLambdaFunction: discordCommandsLambda,
    });
  }
}
```
This can of course then be used in your CDK application like so:
```typescript
import { App } from '@aws-cdk/core';
import { SampleDiscordBotStack } from './stacks/sample-discord-bot-stack';

const app = new App();
const startAPIStack = new SampleDiscordBotStack(app, 'SampleDiscordBotStack');
```

## Full Demo Project
A full example project utilzing this construct can be found [here](https://github.com/RGB-Schemes/oculus-start-bot). Specifically, the [start-api-stack.ts](https://github.com/RGB-Schemes/oculus-start-bot/blob/mainline/src/stacks/start-api-stack.ts) file uses the construct, with [DiscordCommands.ts](https://github.com/RGB-Schemes/oculus-start-bot/blob/mainline/src/functions/DiscordCommands.ts) being the commands file (like shown above).

# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `npm run lint`       perform a lint check across the code
 * `npm run fix-lint`   fix any lint issues automatically where possible
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
