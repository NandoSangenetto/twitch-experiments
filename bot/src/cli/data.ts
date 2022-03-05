import raids from "../bots/raids/raids";
import chatCounter from "../bots/chatCounter/chatCounter";
import chatListener from "../bots/chatListener/chatListener";

export const bots = [
  {
    name: "Raid",
    command: "raids",
    description: "Track raids",
    load: () => raids(),
  },
  {
    name: "Chat Counter",
    command: "chatCounter",
    description: "Count channel messages in real time",
    load: () => chatCounter(),
  },
  {
    name: "Chat Listener",
    command: "chatListener",
    description: "Listen to a channel and send messages accordingly",
    load: () => chatListener(),
  },
];

export const botNames = bots.map((bot) => bot.name);
