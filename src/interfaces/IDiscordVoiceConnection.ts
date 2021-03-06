import { Guild, StreamDispatcher, VoiceConnection } from "discord.js";

export interface IDiscordVoiceConnection {
  guild: Guild;
  stream?: StreamDispatcher;
  connection: VoiceConnection;
}
