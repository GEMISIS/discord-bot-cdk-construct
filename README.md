# discord-bot-cdk-construct

![Version Badge](https://img.shields.io/github/package-json/v/GEMISIS/discord-bot-cdk-construct?color=blue&logo=Discord) [![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

A CDK Construct for creating a serverless Discord bot. All you need to do is supply your code to handle the commands!

# Architecture Overview
This is the architecture for how this project is laid out server-side. The tools used to create these diagrams are:
- [Architecture Diagrams](https://app.diagrams.net)
- [Sequence Diagrams](https://sequencediagram.org)


The bot has a fairly straightforward setup:
![The architecture diagram for the project.](diagrams/architecture.png?raw=true)

The biggest confusion likely stems from the use of two Lambda functions instead of one. This is to ensure that the initial request can respond within Discord's 3 second time limit and return a proper response to the user.

# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `npm run lint`       perform a lint check across the code
 * `npm run fix-lint`   fix any lint issues automatically where possible
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
