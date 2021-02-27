import { Message } from "discord.js";
import { Command } from "./Command";

/**
 * Responds with 'Hello, world'
 */
export class HelloCommand extends Command {
  getName(): string {
    return "hello";
  }

  getAliases(): string[] {
    return [];
  }

  getCommandAliases(): string[] {
    return [];
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  onCommandCall(parsed: string[], message: Message) {
    message.channel.send("Hello, world");
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  onCommandHelp(parsed: string[], message: Message) {
    message.channel.send("Hello, world");
  }

  onCommandInit() {}

  onCommandDestroy() {}
}
