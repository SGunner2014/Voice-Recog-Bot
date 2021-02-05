import { Message } from "discord.js";

import { Command } from "./Command";

export class HelpCommand extends Command {
  private commands: Command[];

  getName(): string {
    return "help";
  }
  getAliases(): string[] {
    return [];
  }
  onCommandCall(parsed: string[], message: Message) {
    let toSend = `Found ${this.commands.length} loaded commands:\`\`\``;
    this.commands.forEach((command, index) => {
      toSend += `\n- ${command.getName()}`;
    });
    toSend += `\`\`\``;
    message.channel.send(toSend);
  }
  onCommandHelp(parsed: string[], message: Message) {}
  onCommandInit(commandListing: Command[]) {
    this.commands = commandListing;
  }
  onCommandDestroy() {}
}
