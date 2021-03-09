import {
  User,
  Guild,
  Client,
  GuildMember,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
  StreamDispatcher,
} from "discord.js";
import ytdl from "ytdl-core";
import Bugsnag from "@bugsnag/js";
import { Readable } from "stream";
import { search } from "yt-search";

import { IHash } from "../interfaces/IHash";
import { ISpeechRequest } from "../interfaces/ISpeechRequest";
import { IDiscordAudioQueueItem } from "../interfaces/IDiscordAudioQueueItem";
import { IDiscordVoiceConnection } from "../interfaces/IDiscordVoiceConnection";

export class DiscordClient {
  private client: Client;
  private connection: VoiceConnection;
  private queue: IDiscordAudioQueueItem[];
  private currentStream: StreamDispatcher = null;
  private connections: IHash<IDiscordVoiceConnection>;
  private currently_playing: IDiscordAudioQueueItem = null;

  /**
   * @param {Client} client
   * @param {VoiceConnection} connection
   */
  constructor(client: Client) {
    this.client = client;
    this.connections = {};
  }

  /**
   * Invoked when the bot joins a new voice channel
   *
   * @param {VoiceConnection} connection
   * @param {Guild} guild
   */
  public onVoiceChannelJoin(connection: VoiceConnection, guild: Guild) {
    try {
      this.connections[guild.id] = { guild, connection };
    } catch (e) {
      // This shouldn't happen
      Bugsnag.notify(e);
    }
  }

  /**
   * Invoked when the bot leaves a voice channel
   *
   * @param {Guild} guild
   */
  public onVoiceChannelLeave(guild: Guild) {
    try {
      delete this.connections[guild.id];
    } catch (e) {
      // This shouldn't happen
      Bugsnag.notify(e);
    }
  }

  /**
   * Checks if the bot is currently in a voice channel
   *
   * @param {string} serverId
   * @returns {boolean}
   */
  public isInVoiceChannel(serverId: string) {
    return Boolean(this.connections[serverId]);
  }

  /**
   * Disconnects the bot from the current voice channel
   */
  public disconnect(serverId: string) {
    this.connections[serverId].stream?.end();
    this.connections[serverId].connection.disconnect();
    delete this.connections[serverId];
  }

  /**
   * Connects the bot to a voice channel.
   *
   * @param {VoiceChannel} voiceChannel
   */
  public connect(voiceChannel: VoiceChannel) {
    voiceChannel.join().then((connection) => {
      this.connection = connection;
    });
  }

  /**
   *
   * @param audio
   * @param serverId
   * @param onStart
   * @param onFinish
   * @returns {StreamDispatcher}
   */
  public playAudio(
    audio: Readable,
    serverId: string,
    onStart?: (serverId: string) => any,
    onFinish?: (serverId: string) => any
  ) {
    try {
      this.connections[serverId].stream = this.connections[serverId].connection
        .play(audio)
        .on("start", () => onStart(serverId))
        .on("finish", () => onFinish(serverId));
    } catch (e) {
      // this shouldn't happen
      Bugsnag.notify(e);
    }
  }

  /**
   * Attempts to stop the currently-playing audio stream for the specified
   * server.
   *
   * @param {string} serverId
   */
  public stopAudio(serverId: string) {
    try {
      this.connections[serverId].stream?.end();
      delete this.connections[serverId].stream;
    } catch (e) {
      // this shouldn't happen
      Bugsnag.notify(e);
    }
  }

  /**
   * @returns {Client}
   */
  public getDiscordClient() {
    return this.client;
  }
}
