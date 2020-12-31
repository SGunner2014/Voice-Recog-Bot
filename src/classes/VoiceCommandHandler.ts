import { Client } from "discord.js";

import { DiscordClient } from "./DiscordClient";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";
import { IIntentResponse } from "../interfaces/IIntentResponse";

export class VoiceCommandHandler {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Handles an incoming voice command and passes it to the relevant handler
   *
   * @param {ISpeechRequest} response
   */
  public handleIncomingCommand(response: ISpeechRequest) {
    const intent = this.determineIntent(response);

    switch (intent.name) {
      case "add_song":
        DiscordClient.handleAddSong(this.client, response);
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
