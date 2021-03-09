import { config } from "dotenv";
import bugsnag from "@bugsnag/js";
import { SpeechClient } from "@google-cloud/speech";
import { Client, Guild, VoiceChannel, VoiceConnection } from "discord.js";

import { Silence } from "./classes/Silence";
import { shouldExcludeUser } from "./utils/Discord";
import { DiscordClient } from "./classes/DiscordClient";
import { CommandHandler } from "./classes/CommandHandler";
import { VoiceChannelState } from "./classes/VoiceChannelState";

config();
bugsnag.start({ apiKey: process.env.BUGSNAG_KEY });

const officialDiscordClient = new Client();
const googleClient = new SpeechClient();

let discordClient: DiscordClient = new DiscordClient(officialDiscordClient);
let channelState: VoiceChannelState;
let commandHandler: CommandHandler = new CommandHandler(
  officialDiscordClient,
  discordClient
);

/**
 * Handler for voice channel join
 *
 * @param {VoiceConnection} connection
 */
function onVoiceChannelJoin(connection: VoiceConnection) {
  channelState = new VoiceChannelState(
    connection,
    googleClient,
    commandHandler
  );
  discordClient.onVoiceChannelJoin(connection, connection.channel.guild);
  connection.play(new Silence(), { type: "opus" });
  channelState.handleJoinedChannel(connection);

  const server = connection.channel.guild;

  connection.on("disconnect", () => onVoiceChannelLeave(connection, server));
}

/**
 * Handler for voice channel leave
 *
 * @param {VoiceConnection} connection
 * @param {Guild} server
 */
function onVoiceChannelLeave(connection: VoiceConnection, server: Guild) {
  commandHandler.onVoiceChannelLeave();
  discordClient.onVoiceChannelLeave(server);
  channelState = null;
}

// On bot logged in and ready
officialDiscordClient.on("ready", async () => {
  console.log("Logged in and connected");

  const voice_channel = (await officialDiscordClient.channels.fetch(
    process.env.VOICE_CHANNEL
  )) as VoiceChannel;
  voice_channel.join();
});

// On member leave or join voice channel
officialDiscordClient.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.channel) {
    // We've just joined a channel, do something
    if (newState.member.id === officialDiscordClient.user.id) {
      onVoiceChannelJoin(newState.connection);
      return;
    }

    if (shouldExcludeUser(newState.member.id)) {
      return;
    }

    // User has connected
    channelState.addConnectedUser(newState.member);
    channelState.createStream(newState.member.user);
  } else if (oldState.channel) {
    // We've just left a channel, do something
    if (newState.member.id === officialDiscordClient.user.id) {
      return;
    }

    if (shouldExcludeUser(oldState.member.id)) {
      return;
    }

    // User has disconnected
    channelState.removeConnectedUser(oldState.member);
  }
});

// On message send
officialDiscordClient.on("message", (message) => {
  commandHandler.handleIncomingMessage(message);
});

officialDiscordClient.on("guildMemberSpeaking", (member) => {});

officialDiscordClient.login(process.env.TOKEN);
