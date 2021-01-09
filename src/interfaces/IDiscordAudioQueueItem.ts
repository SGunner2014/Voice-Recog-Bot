import { GuildMember, User } from "discord.js";

export interface IDiscordAudioQueueItem {
  url: string;
  title: string;
  filename?: string;
  queued_at: number;
  timestamp?: number;
  is_playing: boolean;
  queued_by?: GuildMember | User;
}
