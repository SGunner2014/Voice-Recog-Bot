import { config } from "dotenv";
import { Client, VoiceChannel, VoiceConnection } from "discord.js";

import { Silence } from "./classes/Silence";
import { shouldExcludeUser } from "./utils/Discord";
import { DiscordClient } from "./classes/DiscordClient";
import { VoiceChannelState } from "./classes/VoiceChannelState";
import { TextCommandHandler } from "./classes/TextCommandHandler";
import { VoiceCommandHandler } from "./classes/VoiceCommandHandler";

config();
const client = new Client();
let channelState: VoiceChannelState;
let textHandler: TextCommandHandler;

// On bot logged in and ready
client.on("ready", async () => {
  console.log("Logged in and connected");

  const voice_channel = (await client.channels.fetch(
    process.env.VOICE_CHANNEL
  )) as VoiceChannel;
  voice_channel.join().then(async (connection: VoiceConnection) => {
    console.log("Joined voice channel");
    const discordClient = new DiscordClient(client, connection);

    channelState = new VoiceChannelState(
      connection,
      new VoiceCommandHandler(client, discordClient)
    );
    channelState.setChannelId(process.env.VOICE_CHANNEL);
    connection.play(new Silence(), { type: "opus" });

    channelState.handleJoinedChannel(connection);

    textHandler = new TextCommandHandler(client, discordClient);
  });
});

// On member leave or join voice channel
client.on("voiceStateUpdate", (oldState, newState) => {
  setTimeout(() => {
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
  }, 1000);
});

// On message send
client.on("message", (message) => {
  textHandler.handleIncomingMessage(message);
});

client.on("guildMemberSpeaking", (member) => {});

client.login(process.env.TOKEN);
