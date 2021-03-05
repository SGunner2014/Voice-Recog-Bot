import { ICompleteCommandAlias } from "../../interfaces/ICompleteCommandAlias";
import { DiscordClient } from "../DiscordClient";

export abstract class Command {
  public name: String;
  public commandAlias?: string;
  public completeAliases?: ICompleteCommandAlias[];

  public onCommandInit(
    discordClient: DiscordClient,
    loadedCommands: Command[]
  ) {}
  public onTextHelpCall() {}
  public onCommandDestroy() {}
  public onTextCommandCall() {}
  public onVoiceCommandCall() {}
}
