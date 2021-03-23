# discord-bot-cdk-construct

![Version Badge](https://img.shields.io/github/package-json/v/GEMISIS/discord-bot-cdk-construct?color=blue&logo=Discord) [![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

A CDK Construct for creating a serverless Discord bot. All you need to do is supply your code to handle the commands!

# Architecture Overview
This is the architecture for how this project is laid out server-side. The tools used to create these diagrams are:
- [Architecture Diagrams](https://app.diagrams.net)

The bot has a fairly straightforward setup:

![The architecture diagram for the project.](diagrams/architecture.png?raw=true)

The biggest confusion likely stems from the use of two Lambda functions instead of one. This is to ensure that the initial request can respond within Discord's 3 second time limit and return a proper response to the user.

# Sample Command Lambda Function
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

# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `npm run lint`       perform a lint check across the code
 * `npm run fix-lint`   fix any lint issues automatically where possible
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
