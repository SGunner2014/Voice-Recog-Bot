import ffmpeg from "fluent-ffmpeg";
import { PassThrough, Stream, Writable } from "stream";
import { GuildMember, User, VoiceConnection } from "discord.js";

import { api } from "./WitClient";
import { VoiceCommandHandler } from "./VoiceCommandHandler";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";

const AUDIO_BITRATE = 16_000;
const MIN_SAMPLE_LENGTH = 2; // 2s
const MAX_SAMPLE_LENGTH = 10;

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
    const sampleLength = this.estimateSampleLength(inputAudio);

    // Discard any clips not of sufficient length
    if (sampleLength < MIN_SAMPLE_LENGTH) {
      return;
    }

    // Discard any samples that are too long
    if (sampleLength > MAX_SAMPLE_LENGTH) {
      return;
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
      //
    }
  }

  /**
   * Gives a rough estimate of the sample length (in seconds)
   *
   * @param {Buffer} sample
   * @returns {number}
   */
  private estimateSampleLength(sample: Buffer): number {
    return (sample.byteLength * 8) / AUDIO_BITRATE / 60;
  }
}
