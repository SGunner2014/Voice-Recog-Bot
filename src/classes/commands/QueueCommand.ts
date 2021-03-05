import { Command } from "./Command";
import { DiscordClient } from "../DiscordClient";
import { IDiscordAudioQueueItem } from "../../interfaces/IDiscordAudioQueueItem";

export class QueueCommand extends Command {
  public name = "queue";

  private currentlyPlaying?: IDiscordAudioQueueItem;

  public onCommandInit(discordClient: DiscordClient) {}
}
