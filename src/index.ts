import { config } from "dotenv";
import { Silence } from "./classes/Silence";
import { Client, VoiceChannel, VoiceConnection } from "discord.js";
import { VoiceChannelState } from "./classes/VoiceChannelState";

config();
const client = new Client();
let channelState: VoiceChannelState;

client.on("ready", async () => {
  console.log("Logged in and connected");

  const voice_channel = (await client.channels.fetch(
    process.env.VOICE_CHANNEL
  )) as VoiceChannel;
  voice_channel.join().then(async (connection: VoiceConnection) => {
    console.log("Joined voice channel");

    channelState = new VoiceChannelState(connection);
    channelState.setChannelId(process.env.VOICE_CHANNEL);
    connection.play(new Silence(), { type: "opus" });

    channelState.handleJoinedChannel(connection);
  });
});

client.on("voiceStateUpdate", (oldState, newState) => {
  setTimeout(() => {
    if (
      oldState.member.id !== "793651209562226705" ||
      newState.member.id !== "793651209562226705"
    ) {
      if (newState.channel) {
        // User has connected
        channelState.addConnectedUser(newState.member);
        channelState.createStream(newState.member);
      } else if (oldState.channel) {
        // User has disconnected
        channelState.removeConnectedUser(oldState.member);
        channelState.removeStream(oldState.member);
      }
    }
  }, 600);
});

client.on("guildMemberSpeaking", (member) => {});

client.login(process.env.TOKEN);
