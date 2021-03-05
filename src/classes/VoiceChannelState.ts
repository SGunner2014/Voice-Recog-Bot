import { SpeechClient } from "@google-cloud/speech";
import { GuildMember, User, VoiceConnection } from "discord.js";

import { VoiceStream } from "./VoiceStream";
import { shouldExcludeUser } from "../utils/Discord";
import { VoiceCommandHandler } from "./VoiceCommandHandler";

export class VoiceChannelState {
  private googleClient: SpeechClient;
  private connection: VoiceConnection;
  private commandHandler: VoiceCommandHandler;
  private connectedUsers: { [id: string]: GuildMember };

  constructor(
    connection: VoiceConnection,
    googleClient: SpeechClient,
    commandHandler: VoiceCommandHandler
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
   * @param {GuildMember | User} member
   */
  public createStream(member: GuildMember | User) {
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
      this.createStream(member);
    });
  }
}
