/**
 * The available secrets for our Discord server.
 */
export interface DiscordSecrets {
  publicKey: string;
  clientId: string;
  authToken: string;
  serverId: string;
}

/**
 * A Discord member and their properties.
 */
export interface DiscordMember {
  deaf: boolean;
  roles: string[];
  user: DiscordUser;
}

/**
 * The user information for a Discord member.
 */
export interface DiscordUser {
  id: number;
  username: string;
  discriminator: string;
}

export interface DiscordEventRequest {
  timestamp: string;
  signature: string;
  jsonBody: DiscordJsonBody;
}

export interface DiscordJsonBody {
  id?: string,
  token?: string,
  data?: DiscordRequestData;
  member?: DiscordMember;
  type: number;
  version: number;
}

export interface DiscordRequestData {
  id: string;
  name: string;
  options?: DiscordRequestDataOption[];
}

export interface DiscordRequestDataOption {
  name: string;
  value: string;
}

export interface DiscordEventResponse {
  type: number;
  data?: DiscordResponseData;
}

export interface DiscordResponseData {
  tts: boolean;
  content: string;
  embeds: any[];
  /* eslint-disable camelcase */
  allowed_mentions: string[];
  /* eslint-enable camelcase */
}

