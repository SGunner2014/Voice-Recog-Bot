import { Message } from "discord.js";

import { Command } from "./Command";

export class DisconnectCommand extends Command {
  getName(): string {
    return "disconnect";
  }
  getAliases(): string[] {
    return [];
  }
  onCommandCall(parsed: string[], message: Message) {
    message.channel.send("NYI");
  }
  onCommandHelp(parsed: string[], message: Message) {
    message.channel.send("NYI");
  }
  onCommandInit() {}
  onCommandDestroy() {}
}
