import { config } from "dotenv";
import bugsnag from "@bugsnag/js";
import { SpeechClient } from "@google-cloud/speech";
import { Client, VoiceChannel, VoiceConnection } from "discord.js";

import { Silence } from "./classes/Silence";
import { shouldExcludeUser } from "./utils/Discord";
import { DiscordClient } from "./classes/DiscordClient";
import { VoiceChannelState } from "./classes/VoiceChannelState";
import { TextCommandHandler } from "./classes/TextCommandHandler";
import { VoiceCommandHandler } from "./classes/VoiceCommandHandler";

config();
bugsnag.start({ apiKey: process.env.BUGSNAG_KEY });

const officialDiscordClient = new Client();
const googleClient = new SpeechClient();

let discordClient: DiscordClient = new DiscordClient(officialDiscordClient);
let channelState: VoiceChannelState;
let textHandler: TextCommandHandler = new TextCommandHandler(
  officialDiscordClient,
  discordClient
);

const onVoiceChannelJoin = (connection: VoiceConnection) => {
  channelState = new VoiceChannelState(
    connection,
    googleClient,
    new VoiceCommandHandler(officialDiscordClient, discordClient)
  );
  discordClient.onVoiceChannelJoin(connection, connection.channel.guild);
  connection.play(new Silence(), { type: "opus" });
  channelState.handleJoinedChannel(connection);
};

const onVoiceChannelLeave = (connection: VoiceConnection) => {
  textHandler.onVoiceChannelLeave();
  discordClient.onVoiceChannelLeave(connection.channel.guild);
  channelState = null;
};

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
    channelState.createStream(newState.member);
  } else if (oldState.channel) {
    // We've just left a channel, do something
    if (newState.member.id === officialDiscordClient.user.id) {
      onVoiceChannelLeave(newState.connection);
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
  textHandler.handleIncomingMessage(message);
});

officialDiscordClient.on("guildMemberSpeaking", (member) => {});

officialDiscordClient.login(process.env.TOKEN);
