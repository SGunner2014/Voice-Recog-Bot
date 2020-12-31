import axios, { AxiosInstance } from "axios";

export const api = axios.create({
  baseURL: "https://api.wit.ai",
  headers: { Authorization: "Bearer B7PML5V2Y7Y6KDSSG34Z73IKDVVYYWUO" },
});
