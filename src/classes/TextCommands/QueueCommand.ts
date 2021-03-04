import { Message, MessageEmbed } from "discord.js";

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

  getCommandAliases(): string[] {
    return ["play", "skip", "queue", "list", "np"];
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  onCommandCall(parsed: string[], message: Message) {
    if (this.getAliases().includes(parsed[0]) || parsed[0] === this.getName()) {
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
          case "np":
            this.handleNowPlaying(parsed, message);
            break;
        }
      }
    } else if (this.getCommandAliases().includes(parsed[0])) {
      // Allow for assigning simple aliases to sub-commands
      this.onCommandCall(["queue", ...parsed], message);
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
    if (!this.discordClient.isInVoiceChannel()) {
      message.channel.send(
        "The bot must be in a voice channel to use this command."
      );
      return;
    }

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
    if (!this.discordClient.isInVoiceChannel()) {
      message.channel.send(
        "The bot must be in a voice channel to use this command."
      );
      return;
    }

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
    if (!this.discordClient.isInVoiceChannel()) {
      message.channel.send(
        "The bot must be in a voice channel to use this command."
      );
      return;
    }

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
    if (!this.discordClient.isInVoiceChannel()) {
      message.channel.send(
        "The bot must be in a voice channel to use this command."
      );
      return;
    }

    const queue = this.discordClient.getQueue();
  }

  /**
   * Handles a request to list the currently-playing song.
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleNowPlaying(parsed: string[], message: Message) {
    if (!this.discordClient.isInVoiceChannel()) {
      message.channel.send(
        "The bot must be in a voice channel to use this command."
      );
      return;
    }

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Currently playing");

    const currentlyPlaying = this.discordClient.getCurrentlyPlaying();

    if (currentlyPlaying === undefined || currentlyPlaying === null) {
      embed.setDescription(
        `Nothing is currently playing, queue something with \`${process.env.TEXT_COMMAND_TRIGGER}play\``
      );
    } else {
      embed.setDescription(currentlyPlaying.title).addFields({
        name: "Queued by",
        value: currentlyPlaying.queued_by ?? "Unknown",
      });
    }

    embed.setTimestamp();

    message.channel.send(embed);
  }
}
