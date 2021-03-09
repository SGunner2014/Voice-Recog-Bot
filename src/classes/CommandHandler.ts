import Bugsnag from "@bugsnag/js";
import { Client, Message } from "discord.js";

import { Command } from "./commands/Command";
import { DiscordClient } from "./DiscordClient";
import { QueueCommand } from "./commands/QueueCommand";
import { UptimeCommand } from "./commands/UptimeCommand";
import { ConnectCommand } from "./commands/ConnectCommand";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";
import { DisconnectCommand } from "./commands/DisconnectCommand";

export class CommandHandler {
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
    this.commands.push(new UptimeCommand());
    this.commands.push(new ConnectCommand());
    this.commands.push(new DisconnectCommand());

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
          command.commandAlias?.includes(args[0])
        ) {
          try {
            command.onTextCommandCall(args, message);
          } catch (e) {
            //
            console.log(e);
          }
          return false;
        } else {
          return true;
        }
      });
    }
  }

  /**
   * Invoked when a user makes a new command request via voice
   *
   * @param {ISpeechRequest} incomingCommand
   */
  public handleIncomingVoiceCommand(incomingCommand: ISpeechRequest) {
    this.commands.every((command, index) => {
      if (command.voiceIntents?.includes(incomingCommand.intent)) {
        try {
          command.onVoiceCommandCall(incomingCommand);
        } catch (e) {
          Bugsnag.notify(e);
        }
        return false;
      }

      return true;
    });
  }
}
