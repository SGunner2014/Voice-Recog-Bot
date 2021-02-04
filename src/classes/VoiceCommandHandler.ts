import { Client } from "discord.js";

import { DiscordClient } from "./DiscordClient";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";
import { IIntentResponse } from "../interfaces/IIntentResponse";

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
    const intent = this.determineIntent(response);

    switch (intent?.name) {
      case "add_song":
        await this.discordClient.handleAddSong(this.client, response);
        await this.discordClient.handleListQueue(this.client);
        break;
      case "skip_song":
        this.discordClient.handleSkipSong(this.client, response);
        break;
    }
  }

  /**
   * @param {ISpeechRequest} response
   * @returns {IIntentResponse}
   */
  private determineIntent(response: ISpeechRequest): IIntentResponse {
    response.intents.sort((intentResponseA, intentResponseB) => {
      if (intentResponseA.confidence > intentResponseB.confidence) return 1;
      else if (intentResponseA.confidence < intentResponseB.confidence)
        return -1;
      else return 0;
    });

    return response.intents[0];
  }
}
