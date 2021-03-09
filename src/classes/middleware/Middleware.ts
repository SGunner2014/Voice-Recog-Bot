import { GuildMember, Message } from "discord.js";

export abstract class Middleware {
  public name: string;

  public abstract onTextCommandCall(
    parsed: string[],
    message: Message
  ): boolean;
  public abstract onVoiceCommandCall(
    parsed: string[],
    member: GuildMember
  ): boolean;
}
