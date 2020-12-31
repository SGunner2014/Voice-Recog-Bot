import { Client, TextChannel } from "discord.js";

import { ISpeechRequest } from "../interfaces/ISpeechRequest";

export class DiscordClient {
  /**
   * Handles a request to add a song to the current playlist
   *
   * @param {Client} client
   * @param {ISpeechRequest} request
   */
  public static async handleAddSong(client: Client, request: ISpeechRequest) {
    const commandChannel = (await client.channels.fetch(
      process.env.COMMAND_CHANNEL
    )) as TextChannel;

    console.log(request.entities);
    await commandChannel.send(
      "!play " + request.entities?.["play_song:play_song"]?.[0]?.body
    );
  }
}
