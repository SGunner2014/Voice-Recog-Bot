import human from "human-time";
import { Message } from "discord.js";

import { Command } from "./Command";
import { DiscordClient } from "../DiscordClient";

export class UptimeCommand extends Command {
  public name = "uptime";

  private initTime: Date;

  /**
   * @param {DiscordClient} discordClient
   * @param {Command[]} loadedCommands
   */
  public onCommandInit(
    discordClient: DiscordClient,
    loadedCommands: Command[]
  ) {
    this.initTime = new Date();
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  public onTextCommandCall(parsed: string[], message: Message) {
    const currentTime = new Date().getTime() / 1000;
    const timeDifference = currentTime - this.initTime.getTime() / 1000;
    let humanDifference: string = human(timeDifference);
    humanDifference = humanDifference.slice(0, humanDifference.length - 4); // remove ' ago'
    message.channel.send(`Uptime: ${humanDifference}`);
  }
}
