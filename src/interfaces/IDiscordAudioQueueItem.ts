import { User } from "discord.js";

export interface IDiscordAudioQueueItem {
  url: string;
  queued_by?: User;
  filename?: string;
  queued_at: number;
  timestamp?: number;
  is_playing: boolean;
}
