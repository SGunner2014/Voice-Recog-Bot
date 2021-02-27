export interface IIntentResponse {
  id: string;
  confidence: number;
  name: "Play_Song" | "Skip_Song";
}
