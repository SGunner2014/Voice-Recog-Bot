import { Message } from "discord.js";

export abstract class Command {
  abstract getName(): string;
  abstract getAliases(): string[];

  abstract onCommandCall(parsed: string[], message: Message);
  abstract onCommandHelp(parsed: string[], message: Message);
  abstract onCommandInit(commandListing: Command[]);
  abstract onCommandDestroy();
}
