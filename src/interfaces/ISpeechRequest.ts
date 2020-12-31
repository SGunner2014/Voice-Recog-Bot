import { ISpeechEntity } from "./ISpeechEntity";
import { IIntentResponse } from "./IIntentResponse";

export interface ISpeechRequest {
  traits: any;
  text: string;
  intents: IIntentResponse[];
  entities: { ["play_song:play_song"]: ISpeechEntity[] };
}
