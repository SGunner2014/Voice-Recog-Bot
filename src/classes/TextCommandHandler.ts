import { Client, Message } from "discord.js";

import { DiscordClient } from "./DiscordClient";
import { Command } from "./TextCommands/Command";
import { HelpCommand } from "./TextCommands/HelpCommand";
import { HelloCommand } from "./TextCommands/HelloCommand";
import { QueueCommand } from "./TextCommands/QueueCommand";
import { UptimeCommand } from "./TextCommands/UptimeCommand";
import { ConnectCommand } from "./TextCommands/ConnectCommand";
import { DisconnectCommand } from "./TextCommands/DisconnectCommand";

export class TextCommandHandler {
  private client: Client;
  private commands: Command[];
  private discordClient: DiscordClient;
  private hasJoinedVoiceChannel: boolean = false;

  constructor(client: Client, discordClient: DiscordClient) {
    this.commands = [];
    this.client = client;
    this.discordClient = discordClient;

    this.commands.push(new HelpCommand());
    this.commands.push(new HelloCommand());
    this.commands.push(new QueueCommand());
    this.commands.push(new UptimeCommand());
    this.commands.push(new ConnectCommand());
    this.commands.push(new DisconnectCommand());

    this.commands.forEach((command, index) => {
      command.onCommandInit(this.commands, this.discordClient);
    });
  }

  public onVoiceChannelLeave() {
    this.discordClient = null;
    this.hasJoinedVoiceChannel = false;
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
          command.getName() === args[0] ||
          command.getAliases().includes(args[0]) ||
          command.getCommandAliases().includes(args[0])
        ) {
          command.onCommandCall(args, message);
          return false;
        } else {
          return true;
        }
      });
    }
  }
}
