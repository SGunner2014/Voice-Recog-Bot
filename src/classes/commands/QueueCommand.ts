import ytdl from "ytdl-core";
import { search } from "yt-search";
import { Client, Message, MessageEmbed } from "discord.js";

import { Command } from "./Command";
import { IHash } from "../../interfaces/IHash";
import { DiscordClient } from "../DiscordClient";
import { IDiscordAudioQueue } from "../../interfaces/IDiscordAudioQueue";

export class QueueCommand extends Command {
  public name = "queue";

  private discordClient: DiscordClient;
  private queues: IHash<IDiscordAudioQueue>;

  public onCommandInit(discordClient: DiscordClient) {
    this.queues = {};
    this.discordClient = discordClient;
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  public onTextCommandCall(parsed: string[], message: Message) {
    if (parsed.length > 1) {
      switch (parsed[1]) {
        case "list":
          this.handleListQueue(parsed, message);
          break;
        case "add":
          this.handleAddSong(parsed, message);
          break;
        case "skip":
          this.handleSkip(parsed, message);
          break;
      }
    } else {
      // Just return the queue
      this.handleListQueue(parsed, message);
    }
  }

  /**
   * Returns a list of queued items if there is a queue for that server and items
   * queued.
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleListQueue(parsed: string[], message: Message) {
    const serverId = message.guild.id;
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Queued Videos");

    if (
      this.queues[serverId] !== undefined &&
      this.queues[serverId].items.length > 0
    ) {
      embed.addField(
        "Currently Queued Items:",
        this.queues[serverId].items
          .slice(0, 10)
          .map((item, index) => {
            return `${index}) ${item.title}`;
          })
          .join("\n")
      );
    } else {
      embed.setDescription("There are no items currently queued.");
    }

    embed.setTimestamp();

    message.channel.send(embed);
  }

  /**
   * Adds a new song to the queue for the current voice channel's server
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private async handleAddSong(parsed: string[], message: Message) {
    const serverId = message.guild.id;

    if (!this.discordClient.isInVoiceChannel(serverId)) {
      message.channel.send(
        "You must be in a voice channel to use this command"
      );
      return;
    }

    if (!this.queues[serverId]) {
      this.queues[serverId] = { items: [], server_id: serverId };
    }

    const embed = new MessageEmbed().setColor("#0099ff");
    const searchTerm = parsed.slice(2).join(" ");
    const results = await search(searchTerm);

    if (results.videos.length === 0) {
      message.channel.send("No results found.");
      return;
    }

    this.queues[serverId].items.push({
      is_playing: false,
      title: results.videos[0].title,
      url: results.videos[0].url,
      queued_at: null,
      queued_by: message.author,
    });

    embed
      .setTitle("Video successfully queued.")
      .setDescription(results.videos[0].title)
      .setThumbnail(results.videos[0].thumbnail)
      .setTimestamp();

    message.channel.send(embed);

    // Finally, if there is no video currently playing we should start
    // this one off.
    if (!this.queues[serverId].currently_playing) {
      this.forceSongSkip(serverId);
    }
  }

  /**
   * Skips the currently playing song
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleSkip(parsed: string[], message: Message) {
    const serverId = message.guild.id;

    if (!this.discordClient.isInVoiceChannel(serverId)) {
      message.channel.send(
        "The bot must be in a voice channel to use this command."
      );
      return;
    }

    if (!this.queues[serverId].currently_playing) {
      message.channel.send("Nothing is currently playing.");
      return;
    }

    this.forceSongSkip(serverId);
  }

  /**
   * @param serverId
   */
  private forceSongSkip(serverId: string) {
    this.discordClient.stopAudio(serverId);

    if (this.queues[serverId].items.length > 0) {
      const nextItem = this.queues[serverId].items.shift();
      this.queues[serverId].currently_playing = nextItem;
      this.discordClient.playAudio(
        ytdl(nextItem.url, { quality: "highestaudio" }),
        serverId,
        (serverId) => this.onSongStart(serverId),
        (serverId) => this.onSongEnd(serverId)
      );
    }
  }

  /**
   * Handler for when a queued video ends
   *
   * @param {string} serverId
   */
  private onSongEnd(serverId: string) {
    delete this.queues[serverId].currently_playing;
    this.forceSongSkip(serverId);
  }

  /**
   * Handler for when a queued video starts playing
   *
   * @param {string} serverId
   */
  private onSongStart(serverId: string) {}
}
