import Fastify, { FastifyInstance } from "fastify";
import pointOfView from "point-of-view";
import { getRandomNumber } from "./helpers/number";
import dotenv from "dotenv";

dotenv.config();

const TWITCH_MOCK_PORT = process.env.TWITCH_MOCK_PORT || 4001;

const server: FastifyInstance = Fastify({});

server.register(pointOfView, {
  engine: {
    ejs: require("ejs"),
  },
});

const channelList: Array<string> = [];

interface IQuerystring {
  username: string;
  password: string;
}

server.get<{
  Params: {
    channel: string;
  };
}>("/:channel", async (request, reply) => {
  const { channel } = request.params;
  const refreshTime = getRandomNumber(30, 60);
  channelList.push(channel);
  console.log(`We are monitoring: ${channelList.join(", ")}`);

  setTimeout(() => {
    const channelIndexPos = channelList.findIndex((c) => c === channel);
    channelList.splice(channelIndexPos, 1);
  }, refreshTime);

  reply.view("./src/templates/index.ejs", {
    channel: request.params.channel,
    nextChannel: channelList.filter((c) => c !== request.params.channel)[
      getRandomNumber(0, channelList.length - 2)
    ],
    refreshTime,
  });
});

server.get("/favicon.ico", async (reply) => "");

server.listen(TWITCH_MOCK_PORT, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
