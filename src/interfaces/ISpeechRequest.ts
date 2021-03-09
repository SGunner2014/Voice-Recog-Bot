import { User } from "discord.js";

import { EIntent } from "../enums/EIntent";

export interface ISpeechRequest {
  text: string;
  issuer: User;
  intent: EIntent;
  serverId: string;
  entities: string[];
}
