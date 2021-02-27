import { GuildMember, User } from "discord.js";

import { EIntent } from "../enums/EIntent";

export interface ISpeechRequest {
  text: string;
  intent: EIntent;
  entities: string[];
  issuer?: GuildMember | User;
}
