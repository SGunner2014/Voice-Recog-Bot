import { Message } from "discord.js";
import { DiscordClient } from "../DiscordClient";
import { Command } from "./Command";

export class ConnectCommand extends Command {
  private discordClient: DiscordClient;

  getName(): string {
    return "connect";
  }

  getAliases(): string[] {
    return ["join"];
  }

  getCommandAliases(): string[] {
    return [];
  }

  onCommandCall(parsed: string[], message: Message) {
    message.guild.members.fetch({ user: message.author }).then((member) => {
      const voiceChannel = member.voice.channel;

      if (voiceChannel === undefined || voiceChannel === null) {
        message.channel.send(
          "You must be in a voice channel to use this command!"
        );
      } else {
        this.discordClient.connect(voiceChannel);
      }
    });
  }

  onCommandHelp(parsed: string[], message: Message) {
    throw new Error("Method not implemented.");
  }

  onCommandInit(commandListing: Command[], discordClient: DiscordClient) {
    this.discordClient = discordClient;
  }

  onCommandDestroy() {}
}
