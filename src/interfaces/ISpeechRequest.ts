import { GuildMember, User } from "discord.js";

import { ISpeechEntity } from "./ISpeechEntity";
import { IIntentResponse } from "./IIntentResponse";

export interface ISpeechRequest {
  traits: any;
  text: string;
  issuer?: GuildMember | User;
  intents: IIntentResponse[];
  entities: { ["Song_Name:Song_Name"]: ISpeechEntity[] };
}
