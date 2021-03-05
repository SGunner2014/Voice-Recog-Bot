import { Client, Message } from "discord.js";

import { Command } from "./commands/Command";
import { DiscordClient } from "./DiscordClient";
import { QueueCommand } from "./commands/QueueCommand";

export class TextCommandHandler {
  private client: Client;
  private commands: Command[];
  private discordClient: DiscordClient;

  /**
   * @param {Client} client
   * @param {DiscordClient} discordClient
   */
  constructor(client: Client, discordClient: DiscordClient) {
    this.commands = [];
    this.client = client;
    this.discordClient = discordClient;

    this.commands.push(new QueueCommand());

    // Initialise each command with list of cmds & discord client
    this.commands.forEach((command, index) => {
      command.onCommandInit(this.discordClient, this.commands);
    });
  }

  public onVoiceChannelLeave() {
    this.discordClient = null;
  }

  /**
   * Invoked when a user sends a new message
   *
   * @param {Message} message
   */
  public handleIncomingMessage(message: Message) {
    if (message.content.startsWith(process.env.TEXT_COMMAND_TRIGGER)) {
      const args = message.content.toLowerCase().slice(1).split(" ");
      this.commands.every((command, index) => {
        if (
          command.name === args[0] ||
          command.commandAlias.includes(args[0])
        ) {
          try {
            command.onTextCommandCall(args, message);
          } catch (e) {
            //
          }
          return false;
        } else {
          return true;
        }
      });
    }
  }
}
