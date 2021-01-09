import { config } from "dotenv";
import { Client, VoiceChannel, VoiceConnection } from "discord.js";

import { Silence } from "./classes/Silence";
import { shouldExcludeUser } from "./utils/Discord";
import { DiscordClient } from "./classes/DiscordClient";
import { VoiceChannelState } from "./classes/VoiceChannelState";
import { VoiceCommandHandler } from "./classes/VoiceCommandHandler";

config();
const client = new Client();
let channelState: VoiceChannelState;

// On bot logged in and ready
client.on("ready", async () => {
  console.log("Logged in and connected");

  const voice_channel = (await client.channels.fetch(
    process.env.VOICE_CHANNEL
  )) as VoiceChannel;
  voice_channel.join().then(async (connection: VoiceConnection) => {
    console.log("Joined voice channel");

    channelState = new VoiceChannelState(
      connection,
      new VoiceCommandHandler(client, new DiscordClient(client, connection))
    );
    channelState.setChannelId(process.env.VOICE_CHANNEL);
    connection.play(new Silence(), { type: "opus" });

    channelState.handleJoinedChannel(connection);
  });
});

// On member leave or join voice channel
client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.channel) {
    if (shouldExcludeUser(newState.member.id)) {
      return;
    }

    // User has connected
    channelState.addConnectedUser(newState.member);
    channelState.createStream(newState.member);
  } else if (oldState.channel) {
    if (shouldExcludeUser(oldState.member.id)) {
      return;
    }
    // User has disconnected
    channelState.removeConnectedUser(oldState.member);
  }
});

client.on("guildMemberSpeaking", (member) => {});

client.login(process.env.TOKEN);
