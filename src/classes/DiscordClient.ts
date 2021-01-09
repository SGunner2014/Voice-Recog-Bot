import fs from "fs";
import ytdl from "ytdl-core";
import { search } from "yt-search";
import ffmpeg from "fluent-ffmpeg";
import {
  Client,
  GuildMember,
  StreamDispatcher,
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
    }
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
    if (this.currently_playing === null) {
      this.currently_playing = this.queue.shift();
      this.downloadVideo(this.currently_playing, () => {
        console.log("Now playing new song");
        this.playSong(this.currently_playing);
      });
      this.currently_playing.is_playing = true;
    }
  }

  /**
   * @param video
   * @param callback
   */
  private downloadVideo(video: IDiscordAudioQueueItem, callback: () => any) {
    const stream = ytdl(video.url, { quality: "highestaudio" });
    ffmpeg(stream)
      .audioBitrate(256)
      .save(`${process.env.DOWNLOAD_DIR}/${video.filename}`)
      .on("progress", (p) => {})
      .on("end", () => {
        console.log(
          `File downloaded: ${process.env.DOWNLOAD_DIR}/${video.filename}`
        );
        callback();
      });
  }

  /**
   * @param {IDiscordAudioQueueItem} queuedItem
   */
  private playSong(queuedItem: IDiscordAudioQueueItem) {
    this.currentStream = this.connection
      .play(`${process.env.DOWNLOAD_DIR}/${queuedItem.filename}`)
      .on("start", () => {
        // Set custom status
        this.client.user.setPresence({
          activity: { name: `'${queuedItem.title}'`, type: "PLAYING" },
        });
      })
      .on("finish", () => {
        console.log("Ended");
        fs.unlink(
          `${process.env.DOWNLOAD_DIR}/${queuedItem.filename}`,
          () => {}
        );
        this.currently_playing = null;
        this.client.user.setPresence(null);
      });
  }
}
