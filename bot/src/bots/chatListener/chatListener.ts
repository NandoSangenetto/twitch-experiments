import WebSocket from "ws";
import colors from "colors";
import commandTeAmo from "./commands/teAmo";
import commandBr from "./commands/brstreamers";
import commandRico from "./commands/rico";
import {
  CHANNELS_DEST,
  TWITCH_OAUTH_PASS,
  TWITCH_WEBSOCKET_URL,
  TWITCH_YOUR_USERNAME,
} from "./config";
import { addSpam, getSpamState } from "./spamControl";

export type CommandType = {
  client: WebSocket;
  channel: string;
  username: string;
};

type RulesType = Array<{
  test: (message: string) => boolean;
  function: (params: CommandType) => void;
}>;

// ADD NEW COMMANDS HERE
const RULES: RulesType = [
  {
    test: (message) => message.includes("te amo"),
    function: commandTeAmo,
  },
  {
    test: (message) => message.includes("ping brstreamers"),
    function: commandBr,
  },
  {
    test: (message) =>
      Boolean(
        message.match("r(i|y)(c|k)(o|a)") || message.match("milionari(o|a)")
      ),
    function: commandRico,
  },
];

const onOpenConnection = (client: WebSocket) => {
  console.log(colors.green("Connected."));
  client.send(`PASS ${TWITCH_OAUTH_PASS}`);
  client.send(`NICK ${TWITCH_YOUR_USERNAME}`);
  console.log(colors.green("Authenticated."));

  CHANNELS_DEST.forEach((c) => {
    client.send(`JOIN #${c}`);
    console.log(colors.cyan(`Reading #${c}...`));
  });

  client.send("");
};

const onReceivedMessage = async ({
  data,
  client,
}: {
  client: WebSocket;
  data: WebSocket.RawData;
}) => {
  const MESSAGE_REGEX =
    /^:.+!.+@(?<username>[A-z0-9]+).tmi.twitch.tv (?<type>[A-Z]+) #(?<channel>[A-z0-9]+) :(?<message>.+)/;
  const match = MESSAGE_REGEX.exec(String(data));
  const {
    username = "",
    type = "",
    channel = "",
    message = "",
  } = match?.groups || {};

  if (!match) console.log(colors.gray(String(data)));
  if (message.length === 0) return;

  const line = `${colors.magenta(`[${type}]`)} ${colors.gray(
    `#${channel}`
  )} ${colors.green(`${username}:`)} ${colors.yellow(`${message}`)}`;
  console.log(line);

  // Hack to make Nando use and test it, to avoid timeout
  setTimeout(
    async () => {
      const firstPassignCommand = RULES.find((rule) => rule.test(message));
      if (firstPassignCommand) {
        const spamStateResp = getSpamState({ username, message });
        if (spamStateResp === "WARNING") {
          client.send(
            `PRIVMSG #${channel} :@${username}, para de SPAM, ô animal. Te respondo mais tarde só.`
          );
          return;
        }
        if (spamStateResp === "SPAM") return;
        firstPassignCommand.function({ client, channel, username });

        addSpam(username, message);
      }
    },
    TWITCH_YOUR_USERNAME === username ? 500 : 0
  );
};

const onClosedConnection = () => {
  console.log(colors.red("Closed"));
  console.log(colors.yellow("Restarting..."));
  startScript();
};

const startScript = () => {
  const client = new WebSocket(TWITCH_WEBSOCKET_URL);
  client.on("open", () => onOpenConnection(client));
  client.on("message", (data) => onReceivedMessage({ data, client }));
  client.on("close", onClosedConnection);
};

export default startScript;
