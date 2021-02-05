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
    if (parsed.length > 1) {
      this.handleCommandHelp(parsed, message);
      return;
    }

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

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleCommandHelp(parsed: string[], message: Message) {
    const notFound = this.commands.every((command, index) => {
      if (
        command.getName() === parsed[1] ||
        parsed[1] in command.getAliases()
      ) {
        message.channel.send(`Displaying help for '${parsed[1]}':`);
        command.onCommandHelp(parsed, message);
        return false;
      }

      return true;
    });

    if (notFound) {
      message.channel.send(`Couldn't find help for '${parsed[1]}'.`);
    }
  }
}
