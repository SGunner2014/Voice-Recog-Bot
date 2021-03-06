import { Message } from "discord.js";

import { Command } from "./Command";
import { DiscordClient } from "../DiscordClient";

export class ConnectCommand extends Command {
  public name = "connect";

  private discordClient: DiscordClient;

  /**
   * @param {DiscordClient} discordClient
   * @param {Command[]} loadedCommands
   */
  public onCommandInit(
    discordClient: DiscordClient,
    loadedCommands: Command[]
  ) {
    this.discordClient = discordClient;
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  public onTextCommandCall(parsed: string[], message: Message) {
    const serverId = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    if (!this.discordClient.isInVoiceChannel(serverId) && voiceChannel) {
      this.discordClient.connect(voiceChannel);
      return;
    }

    message.channel.send("You must be in a voice channel to use this command.");
  }
}
