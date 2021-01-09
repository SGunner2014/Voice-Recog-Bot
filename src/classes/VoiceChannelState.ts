import { GuildMember, User, VoiceConnection } from "discord.js";

import { VoiceStream } from "./VoiceStream";
import { VoiceCommandHandler } from "./VoiceCommandHandler";

export class VoiceChannelState {
  private channelId: string;
  private ignored_users: string[];
  private connection: VoiceConnection;
  private commandHandler: VoiceCommandHandler;
  private connectedUsers: { [id: string]: GuildMember };

  constructor(
    connection: VoiceConnection,
    commandHandler: VoiceCommandHandler
  ) {
    this.connectedUsers = {};
    this.connection = connection;
    this.commandHandler = commandHandler;

    this.connection.on("speaking", (user) => {
      this.createStream(user);
    });

    this.ignored_users = process.env.IGNORED_USERS.split(",");
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
    if (this.ignored_users.indexOf(member.id) === -1) {
      const voiceStream = new VoiceStream(
        member,
        this.connection,
        this.commandHandler
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

  /**
   * @returns {string}
   */
  public getChannelId(): string {
    return this.channelId;
  }

  /**
   * @param {string} channelId
   */
  public setChannelId(channelId: string) {
    this.channelId = channelId;
  }
}
