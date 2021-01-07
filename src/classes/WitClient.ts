import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const api = axios.create({
  baseURL: "https://api.wit.ai",
  headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
});
