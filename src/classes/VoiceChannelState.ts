import { GuildMember, User, VoiceConnection } from "discord.js";
import { Wit } from "node-wit";

import { VoiceStream } from "./VoiceStream";

export class VoiceChannelState {
  private channelId: string;
  private connection: VoiceConnection;
  private connectedUsers: { [id: string]: GuildMember };
  private connectedStreams: { [id: string]: VoiceStream };

  constructor(connection: VoiceConnection) {
    this.connectedUsers = {};
    this.connectedStreams = {};
    this.connection = connection;

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

  public removeConnectedUser(member: GuildMember) {
    delete this.connectedUsers[member.id];
  }

  public getConnectedUsers() {
    return this.connectedUsers;
  }

  /**
   * @param {VoiceConnection} connection
   * @param {GuildMember} member
   */
  public createStream(member: GuildMember | User) {
    const voiceStream = new VoiceStream(member, this.connection);
    this.connectedStreams[member.id] = voiceStream;
  }

  public removeStream(member: GuildMember) {
    delete this.connectedStreams[member.id];
  }

  public handleJoinedChannel(connection: VoiceConnection) {
    connection.channel.members.forEach((member) => {
      this.addConnectedUser(member);
      this.createStream(member);
    });
  }

  public getChannelId(): string {
    return this.channelId;
  }

  public setChannelId(channelId: string) {
    this.channelId = channelId;
  }
}
