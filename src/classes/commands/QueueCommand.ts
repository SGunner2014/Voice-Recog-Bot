import ytdl from "ytdl-core";
import { search } from "yt-search";
import { Message, MessageEmbed, User } from "discord.js";

import { Command } from "./Command";
import { IHash } from "../../interfaces/IHash";
import { DiscordClient } from "../DiscordClient";
import { ISpeechRequest } from "../../interfaces/ISpeechRequest";
import { IDiscordAudioQueue } from "../../interfaces/IDiscordAudioQueue";
import { EIntent } from "../../enums/EIntent";
import { IDiscordAudioQueueItem } from "../../interfaces/IDiscordAudioQueueItem";

export class QueueCommand extends Command {
  public name = "queue";
  public isVoiceEnabled = true;
  public voiceIntents = [EIntent.PLAY_SONG, EIntent.SKIP_SONG];

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
   * Handler for voice calls to this command
   *
   * @param request
   */
  public onVoiceCommandCall(request: ISpeechRequest) {
    switch (request.intent) {
      case EIntent.PLAY_SONG:
        this.internalAddSong(
          request.entities[0],
          request.serverId,
          request.issuer
        );
        break;
      case EIntent.SKIP_SONG:
        this.internalSkipSong(request.serverId);
        break;
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

    const embed = new MessageEmbed().setColor("#0099ff");
    const searchTerm = parsed.slice(2).join(" ");
    const result = await this.internalAddSong(
      searchTerm,
      serverId,
      message.author
    );

    if (!result) {
      message.channel.send("No results found.");
      return;
    }

    embed
      .setTitle("Video successfully queued.")
      .setDescription(result.title)
      .setThumbnail(result.thumbnail)
      .setTimestamp();

    message.channel.send(embed);
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

    if (!this.internalSkipSong(serverId)) {
      message.channel.send("Nothing is currently playing.");
      return;
    }
  }

  /**
   * Skips the currently-playing song
   *
   * @param {string} serverId
   */
  private internalSkipSong(serverId: string): boolean {
    if (!this.queues[serverId].currently_playing) {
      return false;
    }

    this.forceSongSkip(serverId);
  }

  /**
   * Adds a song to the specified queue
   *
   * @param {string} searchTerm
   * @param {string} serverId
   */
  private async internalAddSong(
    searchTerm: string,
    serverId: string,
    requester: User
  ): Promise<IDiscordAudioQueueItem> {
    const results = await search(searchTerm);

    if (results.videos.length === 0) {
      return undefined;
    }

    if (!this.queues[serverId]) {
      this.queues[serverId] = { items: [], server_id: serverId };
    }

    const queueItem = {
      is_playing: false,
      title: results.videos[0].title,
      url: results.videos[0].url,
      queued_at: null,
      queued_by: requester,
      thumbnail: results.videos[0].thumbnail,
    };

    this.queues[serverId].items.push(queueItem);

    // Finally, if there is no video currently playing we should start
    // this one off.
    if (!this.queues[serverId].currently_playing) {
      this.forceSongSkip(serverId);
    }

    return queueItem;
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
