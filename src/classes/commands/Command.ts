import { Message } from "discord.js";

import { DiscordClient } from "../DiscordClient";
import { ICompleteCommandAlias } from "../../interfaces/ICompleteCommandAlias";

export abstract class Command {
  public name: String;
  public commandAlias?: string;
  private middleware?: string[];
  public completeAliases?: ICompleteCommandAlias[];

  public onCommandInit(
    discordClient: DiscordClient,
    loadedCommands: Command[]
  ) {}
  public onTextHelpCall(parsed: string[], message: Message) {}
  public onCommandDestroy() {}
  public onTextCommandCall(parsed: string[], message: Message) {}
  public onVoiceCommandCall(parsed: string[]) {}
}
