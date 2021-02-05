import { Message } from "discord.js";

import { Command } from "./Command";
import { DiscordClient } from "../DiscordClient";

/**
 * Controls general audio-related functionality
 */
export class QueueCommand extends Command {
  private discordClient: DiscordClient;

  getName(): string {
    return "queue";
  }

  getAliases(): string[] {
    return ["playlist", "music", "audio"];
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  onCommandCall(parsed: string[], message: Message) {
    if (parsed.length > 1) {
      switch (parsed[1]) {
        case "skip":
          this.handleSkipSong(parsed, message);
          break;
        case "play":
          this.handleQueueSong(parsed, message);
          break;
        case "list":
          this.handleListQueue(parsed, message);
          break;
        case "remove":
          this.handleRemoveItem(parsed, message);
          break;
      }
    }
  }

  onCommandHelp(parsed: string[], message: Message) {}

  onCommandInit(commandListing: Command[], discordClient: DiscordClient) {
    this.discordClient = discordClient;
  }

  onCommandDestroy() {}

  /**
   * Handles a request to skip the currently-playing song.
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleSkipSong(parsed: string[], message: Message) {
    this.discordClient.skipSong();
    message.react("✅");
  }

  /**
   * Handles a request to queue a new song
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleQueueSong(parsed: string[], message: Message) {
    const searchTerm = parsed.slice(2).join(" ");
    this.discordClient.addSong(searchTerm, message.author);
    message.react("✅");
  }

  /**
   * Handles a request to list the current queue
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleListQueue(parsed: string[], message: Message) {
    const queue = this.discordClient.getQueue();

    if (queue.length) {
      let toSend = "Currently queued videos:```";
      queue.forEach((item, index) => {
        toSend += `\n${index + 1}) ${item.title}`;
      });
      toSend += "```";
      message.channel.send(toSend);
    } else {
      message.channel.send("There are no videos currently queued.");
    }
  }

  /**
   * Handles a request to remove a video from the queue
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleRemoveItem(parsed: string[], message: Message) {
    const queue = this.discordClient.getQueue();
  }
}
