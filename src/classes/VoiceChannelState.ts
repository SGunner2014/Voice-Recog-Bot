import { SpeechClient } from "@google-cloud/speech";
import { GuildMember, User, VoiceConnection } from "discord.js";

import { VoiceStream } from "./VoiceStream";
import { shouldExcludeUser } from "../utils/Discord";
import { CommandHandler } from "./CommandHandler";

export class VoiceChannelState {
  private googleClient: SpeechClient;
  private connection: VoiceConnection;
  private commandHandler: CommandHandler;
  private connectedUsers: { [id: string]: GuildMember };

  constructor(
    connection: VoiceConnection,
    googleClient: SpeechClient,
    commandHandler: CommandHandler
  ) {
    this.connectedUsers = {};
    this.connection = connection;
    this.googleClient = googleClient;
    this.commandHandler = commandHandler;

    this.connection.on("speaking", (user) => {
      this.createStream(user);
    });
  }

  /**
   * @param {GuildMember} member
   */
  public addConnectedUser(member: GuildMember) {
    this.connectedUsers[member.id] = member;
  }

  /**
   * @param {GuildMember} member
   */
  public removeConnectedUser(member: GuildMember) {
    delete this.connectedUsers[member.id];
  }

  /**
   * @returns {{ [id: string]: GuildMember }}
   */
  public getConnectedUsers() {
    return this.connectedUsers;
  }

  /**
   * @param {User} member
   */
  public createStream(member: User) {
    if (shouldExcludeUser(member.id)) {
      const voiceStream = new VoiceStream(
        member,
        this.connection,
        this.commandHandler,
        this.googleClient
      );
    }
  }

  /**
   * @param {VoiceConnection} connection
   */
  public handleJoinedChannel(connection: VoiceConnection) {
    connection.channel.members.forEach((member) => {
      this.addConnectedUser(member);
      this.createStream(member.user);
    });
  }
}
