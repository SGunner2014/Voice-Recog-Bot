import { Message } from "discord.js";

import { Command } from "./Command";
import { DiscordClient } from "../DiscordClient";

export class DisconnectCommand extends Command {
  public name = "disconnect";

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

    if (this.discordClient.isInVoiceChannel(serverId)) {
      this.discordClient.disconnect(serverId);
      return;
    }

    message.channel.send(
      "The bot must be in a voice channel to use this command."
    );
  }
}
