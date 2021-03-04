import { IDiscordAudioQueueItem } from "./IDiscordAudioQueueItem";

export interface IDiscordAudioQueue {
  server_id: String;
  items: IDiscordAudioQueueItem[];
  currently_playing: IDiscordAudioQueueItem;
}
