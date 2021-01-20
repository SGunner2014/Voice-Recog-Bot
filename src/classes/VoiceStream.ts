import ffmpeg from "fluent-ffmpeg";
import { PassThrough, Stream, Writable } from "stream";
import { GuildMember, User, VoiceConnection } from "discord.js";

import { api } from "./WitClient";
import { VoiceCommandHandler } from "./VoiceCommandHandler";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";

const MIN_BUFFER_LENGTH = 100_000; // Buffer must be at least this long to trigger a call to wit.ai

export class VoiceStream {
  private buff: any[];
  private member: GuildMember | User;
  private commandHandler: VoiceCommandHandler;
  private audioStream: Writable | PassThrough;

  /**
   * @param {GuildMember} member
   * @param {VoiceConnection} connection
   */
  constructor(
    member: GuildMember | User,
    connection: VoiceConnection,
    commandHandler: VoiceCommandHandler
  ) {
    this.member = member;
    this.commandHandler = commandHandler;
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
    this.buff = [];

    this.audioStream
      .on("data", (chunk) => {
        this.handleChunk(chunk);
      })
      .on("end", async () => {
        await this.handleEnd();
      });
  }

  /**
   * Invoked when a new data chunk is received
   *
   * @param {Buffer} chunk
   */
  private handleChunk(chunk: Buffer) {
    this.buff.push(chunk);
  }

  /**
   * Invoked when the user finishes speaking
   */
  private async handleEnd() {
    const inputAudio = Buffer.concat(this.buff);

    const readStream = new Stream.Readable({ read() {} });
    readStream.push(inputAudio);

    console.log("probing");
    ffmpeg()
      .input(readStream)
      .fromFormat("wav")
      .ffprobe((err, data) => {
        console.log("probed");
        if (err) {
          console.log(err);
        } else {
          console.log(`Duration: ${data.format.duration}`);
        }
      });

    if (inputAudio.byteLength < MIN_BUFFER_LENGTH) {
      console.log(`Buffer rejected: ${inputAudio.byteLength}`);
      return;
    } else {
      console.log(`Buffer accepted: ${inputAudio.byteLength}`);
    }

    try {
      const returned_value = await api.post<ISpeechRequest>(
        "/speech",
        inputAudio,
        {
          headers: { "Content-Type": "audio/wav" },
        }
      );

      if (returned_value.data.text.length === 0) {
        return;
      }

      returned_value.data.issuer = this.member;

      await this.commandHandler.handleIncomingCommand(returned_value.data);
    } catch (err) {
      console.log(err);
    }
  }
}
