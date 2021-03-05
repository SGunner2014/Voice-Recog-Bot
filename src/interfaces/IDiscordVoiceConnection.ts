import { Guild, VoiceConnection } from "discord.js";

export interface IDiscordVoiceConnection {
  guild: Guild;
  connection: VoiceConnection;
}
