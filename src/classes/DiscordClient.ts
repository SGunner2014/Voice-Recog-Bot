import { search } from "yt-search";
import { Client } from "discord.js";

import { ISpeechRequest } from "../interfaces/ISpeechRequest";

export class DiscordClient {
  private client: Client;

  /**
   * @param {Client} client
   */
  constructor(client: Client) {
    this.client = client;
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
  }
}
