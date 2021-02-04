import { Client, Message } from "discord.js";

import { DiscordClient } from "./DiscordClient";
import { ITextCommand } from "../interfaces/ITextCommand";

export class TextCommandHandler {
  private client: Client;
  private discordClient: DiscordClient;

  constructor(client: Client, discordClient: DiscordClient) {
    this.client = client;
    this.discordClient = discordClient;
  }

  /**
   * Invoked when a user sends a new message
   *
   * @param {Message} message
   */
  public handleIncomingMessage(message: Message) {
    if (message.content.startsWith(process.env.TEXT_COMMAND_TRIGGER)) {
      const args = message.content.slice(1).split(" ");
    }
  }

  /**
   * Handles an incoming text command and passes it to the relevant handler
   *
   * @param {ITextCommand} command
   */
  private handleIncomingCommand(command: ITextCommand) {
    switch (command.command) {
    }
  }
}
