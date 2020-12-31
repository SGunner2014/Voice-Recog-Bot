import { IIntentResponse } from "./IIntentResponse";

export interface ISpeechRequest {
  traits: any;
  text: string;
  intents: IIntentResponse[];
  entities: { [id: string]: any };
}
