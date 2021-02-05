import ytdl from "ytdl-core";
import { search } from "yt-search";
import {
  Client,
  GuildMember,
  StreamDispatcher,
  TextChannel,
  User,
  VoiceConnection,
} from "discord.js";

import { ITextCommand } from "../interfaces/ITextCommand";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";
import { IDiscordAudioQueueItem } from "../interfaces/IDiscordAudioQueueItem";

export class DiscordClient {
  private client: Client;
  private connection: VoiceConnection;
  private queue: IDiscordAudioQueueItem[];
  private currentStream: StreamDispatcher = null;
  private currently_playing: IDiscordAudioQueueItem = null;

  /**
   * @param {Client} client
   * @param {VoiceConnection} connection
   */
  constructor(client: Client, connection: VoiceConnection) {
    this.queue = [];
    this.client = client;
    this.connection = connection;
  }

  /**
   * Handles a request to add a song to the current playlist
   *
   * @param {Client} client
   * @param {ISpeechRequest} request
   */
  public async handleAddSong(client: Client, request: ISpeechRequest) {
    const searchTerm = request.entities["play_song:play_song"][0];
    const result = await search(searchTerm.body);
    this.queueSong(
      client,
      result.videos[0].url,
      request.issuer,
      result.videos[0].title
    );
  }

  /**
   * Handles a request to skip the currently-playing song
   *
   * @param {Client} client
   * @param {ISpeechRequest} request
   */
  public async handleSkipSong(client: Client, request: ISpeechRequest) {
    if (this.currently_playing !== null) {
      console.log("Ending stream");
      this.currentStream.end(() => {
        console.log("Ended");
      });
      this.currently_playing = null;
      this.onQueueSong();
    }
  }

  public async handleListQueue(client: Client) {
    const channel = (await client.channels.fetch(
      "306179748793548800"
    )) as TextChannel;
    this.queue.forEach(async (element) => {
      await channel.send(element.title);
    });
  }

  /**
   * Handles a request to the help command
   *
   * @param {ITextCommand} command
   */
  public async handleHelp(command: ITextCommand) {
    await command.message.reply("Hello, world.");
  }

  /**
   * @param {Client} client
   * @param {string} url
   */
  public queueSong(
    client: Client,
    url: string,
    requester: GuildMember | User,
    title: string
  ) {
    // Queue song here
    console.log(`Received request to queue song: ${url}`);
    this.queue.push({
      is_playing: false,
      queued_by: requester,
      queued_at: Date.now(),
      filename: `${Date.now().toString()}.mp3`,
      url,
      title,
    });

    this.onQueueSong();
  }

  private onQueueSong() {
    if (this.currently_playing === null && this.queue.length > 0) {
      this.currently_playing = this.queue.shift();
      this.playSong(this.currently_playing);
      this.currently_playing.is_playing = true;
    }
  }

  /**
   * @param {IDiscordAudioQueueItem} queuedItem
   */
  private playSong(queuedItem: IDiscordAudioQueueItem) {
    this.currentStream = this.connection
      .play(ytdl(queuedItem.url, { quality: "highestaudio" }))
      .on("start", () => {
        // Set custom status
        this.client.user.setPresence({
          activity: { name: `'${queuedItem.title}'`, type: "PLAYING" },
        });
      })
      .on("end", () => {
        this.currently_playing = null;
      })
      .on("finish", () => {
        console.log("Ended");
      });
  }
}
