import ffmpeg from "fluent-ffmpeg";
import { PassThrough, Writable } from "stream";
import { GuildMember, User, VoiceConnection } from "discord.js";

import { api } from "./WitClient";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";

export class VoiceStream {
  private buff: any[];
  private member: GuildMember | User;
  private audioStream: Writable | PassThrough;

  /**
   * @param {GuildMember} member
   * @param {Readable} stream
   */
  constructor(member: GuildMember | User, connection: VoiceConnection) {
    this.member = member;
    this.audioStream = ffmpeg(
      connection.receiver.createStream(member, {
        mode: "pcm",
      })
    )
      .inputFormat("s32le")
      .audioFrequency(44100)
      .audioChannels(1)
      .audioCodec("pcm_s16le")
      .format("wav")
      .pipe();

    this.audioStream.on("data", this.handleChunk).on("end", this.handleEnd);
  }

  /**
   * Invoked when a new data chunk is received
   *
   * @param {Buffer} chunk
   */
  private handleChunk(chunk: Buffer) {
    if (typeof this.buff === "undefined") {
      this.buff = [];
    }
    this.buff.push(chunk);
  }

  /**
   * Invoked when the user finishes speaking
   */
  private async handleEnd() {
    const inputAudio = Buffer.concat(this.buff);
    try {
      const returned_value = await api.post<ISpeechRequest>(
        "/speech",
        inputAudio,
        {
          headers: { "Content-Type": "audio/wav" },
        }
      );
      console.log(returned_value.data.text);
    } catch (err) {
      // console.log(err);
    }
  }
}
