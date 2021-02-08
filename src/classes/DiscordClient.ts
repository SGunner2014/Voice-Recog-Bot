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
    const searchTerm = request.entities["Song_Name:Song_Name"][0];
    const result = await search(searchTerm.body);
    this.queueSong(
      client,
      result.videos[0].url,
      result.videos[0].title,
      request.issuer
    );
  }

  /**
   * Queues a new song
   *
   * @param {string} searchTerm
   * @param {User | GuildMember} member
   */
  public addSong(searchTerm: string, member?: User | GuildMember) {
    search(searchTerm)
      .then((result) => {
        this.queueSong(
          this.client,
          result.videos[0].url,
          result.videos[0].title,
          member
        );
      })
      .catch(() => {});
  }

  /**
   * Handles a request to skip the currently-playing song
   *
   * @param {Client} client
   * @param {ISpeechRequest} request
   */
  public handleSkipSong(client: Client, request: ISpeechRequest) {
    if (this.currently_playing !== null) {
      this.currentStream.end(() => {});
      this.onSongEnd();
    }
  }

  public skipSong() {
    this.handleSkipSong(this.client, null);
  }

  public async handleListQueue(client: Client) {
    const channel = (await client.channels.fetch(
      "306179748793548800"
    )) as TextChannel;
    this.queue.forEach(async (element) => {
      await channel.send(element.title);
    });
  }

  public getQueue(): IDiscordAudioQueueItem[] {
    return this.queue;
  }

  /**
   * @param {Client} client
   * @param {string} url
   */
  public queueSong(
    client: Client,
    url: string,
    title: string,
    requester?: GuildMember | User
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

  private onSongEnd() {
    this.currently_playing = null;
    // clear presence here
    this.onQueueSong();
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
      .on("end", () => {})
      .on("finish", () => {
        this.onSongEnd();
      });
  }
}
