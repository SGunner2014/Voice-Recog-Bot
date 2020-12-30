import * as fs from "fs";
import * as dotenv from "dotenv";
import { Readable } from "stream";
import * as Discord from "discord.js";
import { OpusEncoder } from "@discordjs/opus";
import { VOICE_CHANNEL_ID } from "./constants";

const encoder = new OpusEncoder(48000, 2);

dotenv.config();

const client = new Discord.Client();

class Silence extends Readable {
  _read() {
    this.push(Buffer.from([0xf8, 0xff, 0xfe]));
  }
}

client.on("ready", async () => {
  console.log("Ready");

  let channel = (await client.channels.fetch(
    VOICE_CHANNEL_ID
  )) as Discord.VoiceChannel;

  channel.join().then(async (connection) => {
    console.log("joined");
    connection.play(new Silence(), { type: "opus" });
    const userId = "95641439161028608";
    const audio = connection.receiver.createStream(userId, {
      mode: "opus",
      end: "manual",
    });
    audio
      .on("data", (chunk) => console.log(chunk))
      .on("close", () => console.log("closed"));
    setTimeout(() => {
      connection.play(audio, { type: "opus" });
    }, 600);
  });
});

client.login(process.env.TOKEN);
