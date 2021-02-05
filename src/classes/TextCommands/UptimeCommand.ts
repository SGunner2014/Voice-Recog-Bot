import human from "human-time";
import { Message } from "discord.js";

import { Command } from "./Command";

export class UptimeCommand extends Command {
  private initTime: Date;

  getName(): string {
    return "uptime";
  }
  getAliases(): string[] {
    return [];
  }
  onCommandCall(parsed: string[], message: Message) {
    const currentTime = new Date().getTime() / 1000;
    const timeDifference = currentTime - this.initTime.getTime() / 1000;
    let humanDifference: string = human(timeDifference);
    humanDifference = humanDifference.slice(0, humanDifference.length - 4); // remove ' ago'
    message.channel.send(`Uptime: ${humanDifference}`);
  }
  onCommandHelp(parsed: string[], message: Message) {
    message.channel.send("Displays the current bot uptime.");
  }
  onCommandInit() {
    this.initTime = new Date();
  }
  onCommandDestroy() {}
}
