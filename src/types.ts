/**
 * The available secrets for our Discord server.
 */
export interface IDiscordSecrets {
  publicKey: string;
  applicationId: string;
  authToken: string;
  serverId: string;
}

/**
 * A server role assigned to a user.
 */
export interface IDiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
}

/**
 * A Discord member and their properties.
 */
export interface IDiscordMember {
  deaf: boolean;
  roles: string[];
  user: IDiscordUser;
}

/**
 * The user information for a Discord member.
 */
export interface IDiscordUser {
  id: number;
  username: string;
  discriminator: string;
}

/**
 * The incoming request, created via API Gateway request templates.
 */
export interface IDiscordEventRequest {
  timestamp: string;
  signature: string;
  jsonBody: IDiscordJsonBody;
}

/**
 * The actual Discord request data.
 */
export interface IDiscordJsonBody {
  id?: string,
  token?: string,
  data?: IDiscordRequestData;
  member?: IDiscordMember;
  type: number;
  version: number;
}

/**
 * The data in the Discord request. Should be handled for actually parsing commands.
 */
export interface IDiscordRequestData {
  id: string;
  name: string;
  options?: IDiscordRequestDataOption[];
}

/**
 * The name and value for a given command option if available.
 */
export interface IDiscordRequestDataOption {
  name: string;
  value: string;
}

/**
 * The information for the endpoint to use when sending a response.
 * 
 * Default version for the API version is 8 when not specified.
 */
export interface IDiscordEndpointInfo {
  apiVersion?: string;
  authToken: string;
  applicationId: string;
}

/**
 * The actual response data that will be used in the resulting Discord message.
 */
export interface IDiscordResponseData {
  tts: boolean;
  content: string;
  embeds: any[];
  allowedMentions: string[];
}

