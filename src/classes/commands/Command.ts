import { Message } from "discord.js";

import { DiscordClient } from "../DiscordClient";
import { ICompleteCommandAlias } from "../../interfaces/ICompleteCommandAlias";

export abstract class Command {
  public name: String;
  public commandAlias?: string;
  public middleware?: string[];
  public isTextEnabled: boolean = true;
  public isVoiceEnabled: boolean = false;
  public completeAliases?: ICompleteCommandAlias[];

  public onCommandInit(
    discordClient: DiscordClient,
    loadedCommands: Command[]
  ) {}
  public onCommandDestroy() {}
  public onTextHelpCall(parsed: string[], message: Message) {}
  public onTextCommandCall(parsed: string[], message: Message) {}
  public onVoiceCommandCall(parsed: string[]) {}
}
