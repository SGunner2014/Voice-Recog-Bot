import { Client, Message } from "discord.js";

import { DiscordClient } from "./DiscordClient";
import { Command } from "./TextCommands/Command";
import { ITextCommand } from "../interfaces/ITextCommand";
import { HelloCommand } from "./TextCommands/HelloCommand";
import { UptimeCommand } from "./TextCommands/UptimeCommand";
import { DisconnectCommand } from "./TextCommands/DisconnectCommand";
import { HelpCommand } from "./TextCommands/HelpCommand";

export class TextCommandHandler {
  private client: Client;
  private commands: Command[];
  private discordClient: DiscordClient;

  constructor(client: Client, discordClient: DiscordClient) {
    this.commands = [];
    this.client = client;
    this.discordClient = discordClient;

    this.commands.push(new HelpCommand());
    this.commands.push(new HelloCommand());
    this.commands.push(new UptimeCommand());
    this.commands.push(new DisconnectCommand());

    this.commands.forEach((command, index) => {
      command.onCommandInit(this.commands);
    });
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
        if (command.getName() === args[0] || args[0] in command.getAliases()) {
          command.onCommandCall(args, message);
          return false;
        } else {
          return true;
        }
      });
    }
  }
}
