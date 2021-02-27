import { GuildMember, User } from "discord.js";

import { IIntentResponse } from "./IIntentResponse";
import { ISpeechEntity } from "./ISpeechEntity";

export interface IMessageRequest {
  traits: any;
  text: string;
  intents: IIntentResponse[];
  issuer?: GuildMember | User;
  entities: { ["Song_Name:Song_Name"]: ISpeechEntity[] };
}
