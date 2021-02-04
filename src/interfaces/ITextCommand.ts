import { Message } from "discord.js";
import { TextCommandEnum } from "../enums/TextCommandEnum";

export interface ITextCommand {
  args: string[];
  message: Message;
  command: TextCommandEnum;
}
