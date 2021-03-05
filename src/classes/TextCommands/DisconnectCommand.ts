import { Message } from "discord.js";

import { Command } from "./Command";
import { DiscordClient } from "../DiscordClient";

export class DisconnectCommand extends Command {
  private discordClient: DiscordClient;

  getName(): string {
    return "disconnect";
  }
  getAliases(): string[] {
    return ["leave"];
  }
  getCommandAliases(): string[] {
    return [];
  }
  onCommandCall(parsed: string[], message: Message) {
    this.discordClient.disconnect();
  }
  onCommandHelp(parsed: string[], message: Message) {
    message.channel.send("Disconnects the bot from the current voice channel.");
  }

  onCommandInit(commandListing: Command[], discordClient: DiscordClient) {
    this.discordClient = discordClient;
  }

  onCommandDestroy() {}
}
