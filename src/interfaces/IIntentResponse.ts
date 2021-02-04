export interface IIntentResponse {
  id: string;
  name: "add_song" | "skip_song";
  confidence: number;
}
