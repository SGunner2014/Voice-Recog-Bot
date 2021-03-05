import { Message, MessageEmbed } from "discord.js";

import { Command } from "./Command";
import { IHash } from "../../interfaces/IHash";
import { DiscordClient } from "../DiscordClient";
import { IDiscordAudioQueue } from "../../interfaces/IDiscordAudioQueue";

export class QueueCommand extends Command {
  public name = "queue";

  private discordClient: DiscordClient;
  private queues: IHash<IDiscordAudioQueue>;

  public onCommandInit(discordClient: DiscordClient) {
    this.queues = {};
    this.discordClient = discordClient;
  }

  /**
   * @param {string[]} parsed
   * @param {Message} message
   */
  public onTextCommandCall(parsed: string[], message: Message) {
    if (parsed.length > 1) {
      switch (parsed[1]) {
        case "list":
          this.handleListQueue(parsed, message);
          break;
      }
    } else {
      // Just return the queue
      this.handleListQueue(parsed, message);
    }
  }

  /**
   * Returns a list of queued items if there is a queue for that server and items
   * queued.
   *
   * @param {string[]} parsed
   * @param {Message} message
   */
  private handleListQueue(parsed: string[], message: Message) {
    const serverId = message.guild.id;
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Queued Videos");

    if (
      this.queues[serverId] !== undefined &&
      this.queues[serverId].items.length > 0
    ) {
      embed.addField(
        "Currently Queued Items:",
        this.queues[serverId].items
          .slice(0, 10)
          .map((item, index) => {
            return `${index}) ${item.title}`;
          })
          .join("\n")
      );
    } else {
      embed.setDescription("There are no items currently queued.");
    }

    embed.setTimestamp();

    message.channel.send(embed);
  }

  private handleAddSong(parsed: string[], message: Message) {
    const serverId = message.guild.id;
    const embed = new MessageEmbed().setColor("#0099ff");

    if (!this.discordClient.isInVoiceChannel(serverId)) {

    }

    if (this.queues[serverId] !== undefined && this.queues[serverId].items.length > 0) {
      this.queues[serverId].items.push({
        is_playing: false,
        title: 
        queued_by: message.author,
      })
    }
  }
}
