import fs from "fs";
import ytdl from "ytdl-core";
import { search } from "yt-search";
import ffmpeg from "fluent-ffmpeg";
import { Client, VoiceConnection } from "discord.js";

import { ISpeechRequest } from "../interfaces/ISpeechRequest";
import { IDiscordAudioQueueItem } from "../interfaces/IDiscordAudioQueueItem";

export class DiscordClient {
  private client: Client;
  private connection: VoiceConnection;
  private queue: IDiscordAudioQueueItem[];
  private currently_playing: IDiscordAudioQueueItem;

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
    this.queueSong(client, result.videos[0].url);
  }

  /**
   * @param {Client} client
   * @param {string} url
   */
  public queueSong(client: Client, url: string) {
    // Queue song here
    console.log(`Received request to queue song: ${url}`);
    this.queue.push({
      is_playing: false,
      queued_at: Date.now(),
      filename: `${Date.now().toString()}.mp3`,
      url,
    });

    this.onQueueSong();
  }

  private onQueueSong() {
    if (typeof this.currently_playing === "undefined") {
      this.currently_playing = this.queue.shift();
      this.downloadVideo(this.currently_playing, () => {
        console.log("Now playing new song");
        this.playSong(this.currently_playing);
      });
      this.currently_playing.is_playing = true;
      // this.playSong(this.currently_playing);
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
    this.connection
      .play(`${process.env.DOWNLOAD_DIR}/${queuedItem.filename}`)
      .on("finish", () => {
        fs.unlink(
          `${process.env.DOWNLOAD_DIR}/${queuedItem.filename}`,
          () => {}
        );
      });
  }
}
