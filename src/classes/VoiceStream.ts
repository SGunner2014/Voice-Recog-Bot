import ffmpeg from "fluent-ffmpeg";
import { PassThrough, Writable } from "stream";
import { SpeechClient } from "@google-cloud/speech";
import { GuildMember, User, VoiceConnection } from "discord.js";

import { EIntent } from "../enums/EIntent";
import { CommandHandler } from "./CommandHandler";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";

const AUDIO_BITRATE = 16_000;
const MIN_SAMPLE_LENGTH = 1; // 2s
const MAX_SAMPLE_LENGTH = 10;

export class VoiceStream {
  private buff: any[];
  private member: User;
  private serverId: string;
  private googleClient: SpeechClient;
  private commandHandler: CommandHandler;
  private audioStream: Writable | PassThrough;

  /**
   * @param {GuildMember} member
   * @param {VoiceConnection} connection
   */
  constructor(
    member: User,
    connection: VoiceConnection,
    commandHandler: CommandHandler,
    googleClient: SpeechClient
  ) {
    this.member = member;
    this.commandHandler = commandHandler;
    this.googleClient = googleClient;
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

    this.serverId = connection.channel.guild.id;
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
    try {
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

      let results = (
        await this.googleClient.recognize({
          audio: { content: inputAudio },
          config: {
            encoding: "LINEAR16",
            languageCode: "en-GB",
          },
        })
      )[0]?.results?.[0]?.alternatives?.[0]?.transcript;

      if (results === null || results === undefined) {
        return;
      }

      if (
        !results
          .toLowerCase()
          .startsWith(process.env.TRIGGER_WORD.toLowerCase())
      ) {
        return;
      }

      results = results.substring(process.env.TRIGGER_WORD.length + 1); // remove the trigger word
      console.log(`results: ${results}`);

      const toProcess = this.determineIntent(results);

      this.commandHandler.handleIncomingVoiceCommand(toProcess);
    } catch (e) {
      console.log(e);
    }
  }

  private determineIntent(results: string): ISpeechRequest {
    const command = results.split(" ")[0];

    switch (command) {
      case "play":
        return {
          intent: EIntent.PLAY_SONG,
          entities: [results.substring(command.length + 1)],
          text: results,
          serverId: this.serverId,
          issuer: this.member,
        };
      case "skip":
        return {
          intent: EIntent.SKIP_SONG,
          entities: [],
          text: results,
          serverId: this.serverId,
          issuer: this.member,
        };
      default:
        return {
          intent: EIntent.UNKNOWN,
          entities: [],
          text: results,
          serverId: this.serverId,
          issuer: this.member,
        };
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
