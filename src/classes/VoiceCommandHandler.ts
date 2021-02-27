import { Client } from "discord.js";

import { EIntent } from "../enums/EIntent";
import { DiscordClient } from "./DiscordClient";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";

export class VoiceCommandHandler {
  private client: Client;
  private discordClient: DiscordClient;

  /**
   * @param {Client} client
   * @param {DiscordClient} discordClient
   */
  constructor(client: Client, discordClient: DiscordClient) {
    this.client = client;
    this.discordClient = discordClient;
  }

  /**
   * Handles an incoming voice command and passes it to the relevant handler
   *
   * @param {ISpeechRequest} response
   */
  public async handleIncomingCommand(response: ISpeechRequest) {
    switch (response.intent) {
      case EIntent.PLAY_SONG:
        await this.discordClient.handleAddSong(this.client, response);
        break;
      case EIntent.SKIP_SONG:
        this.discordClient.handleSkipSong(this.client, response);
        break;
    }
  }
}
