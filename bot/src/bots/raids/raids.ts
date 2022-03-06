import https from "https";
import puppeteer, { Puppeteer } from "puppeteer";
import request from "../../helpers/request";

const TWITCH_REGEX =
  process.env.NODE_ENV === "testing"
    ? /^https?:\/\/localhost:4001\/(?<user>.*)(\?referrer=raid)?$/
    : /^https:\/\/www.twitch.tv\/(?<user>.*)(\?referrer=raid)?$/;

type ChannelType = {
  user: string;
  url: string;
  viewerCount: number;
  page?: puppeteer.Page;
};

type ChannelsDictType = {
  [key: string]: ChannelType;
};
type ChannelsDictKeyType = keyof typeof globalWatchingChannels;

const globalWatchingChannels: ChannelsDictType = {};

const createTwitchUrl = ({ user }: { user: string }) =>
  process.env.NODE_ENV === "testing"
    ? `http://localhost:4001/${user}`
    : `https://www.twitch.tv/${user}`;

const removeChannel = async ({ channel }: { channel: ChannelType }) => {
  console.log(`${new Date()}: Closing: ${channel.user}`);
  await channel.page?.close();
  delete globalWatchingChannels[channel.user];
};

const listenChannelRaid = ({
  channel,
  onRaid,
}: {
  channel: ChannelType;
  onRaid?: (params: {
    user: string;
    url: string;
    viewerCount: undefined;
  }) => void;
}) => {
  channel.page?.on("framenavigated", (frame) => {
    const currentUrl = frame.url().replace("?referrer=raid", "");
    const newTwitchUser = TWITCH_REGEX.exec(currentUrl)?.groups?.user;
    const isDifferentChannel = channel.url !== currentUrl;
    if (newTwitchUser && isDifferentChannel && onRaid) {
      onRaid({
        user: newTwitchUser,
        url: createTwitchUrl({ user: newTwitchUser }),
        viewerCount: undefined,
      });
    }
  });
};

const watchChannel = async ({ channel }: { channel: ChannelType }) => {
  try {
    await channel.page?.goto(channel.url);
    await listenChannelRaid({
      channel,
      onRaid: async (newChannel) => {
        console.log(
          `${new Date()}: Raid: ${channel.user} => ${newChannel.user}`
        );
        const isBeingWatched = globalWatchingChannels[newChannel.user];
        if (isBeingWatched) {
          console.log(
            `${new Date()}: Fechando aba duplicada de ${
              newChannel.user
            }, pois já estamos monitorando.`
          );
          await channel.page?.close();
        }
      },
    });
  } catch {
    removeChannel({ channel });
  }
};

const getChannelsFromTwitch = async () => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  const url = "https://brstreamers.dev:8000/public/streams";
  const response = await request<
    Array<{
      user_name: string;
      viewer_count: number;
    }>
  >(url, {
    agent: httpsAgent,
  });

  return response.reduce<ChannelsDictType>((acc, channel) => {
    acc[channel.user_name] = {
      user: channel.user_name,
      url: createTwitchUrl({ user: channel.user_name }),
      viewerCount: channel.viewer_count,
    };
    return acc;
  }, {});
};

const addChannels = ({
  channels,
  channelsKeys,
  browser,
}: {
  channels: ChannelsDictType;
  channelsKeys: Array<ChannelsDictKeyType>;
  browser: puppeteer.Browser;
}) => {
  const channelsToAdd = channelsKeys.filter((c) => !globalWatchingChannels[c]);
  channelsToAdd.forEach(async (c) => {
    const page = await browser.newPage();
    const channel = {
      ...channels[c],
      page,
    };
    globalWatchingChannels[c] = channel;
    console.log(`${new Date()}: ${c} entrou ao vivo`);
    watchChannel({ channel: globalWatchingChannels[c] });
  });
};

const removeChannels = ({
  channelsKeys,
}: {
  channelsKeys: Array<ChannelsDictKeyType>;
}) => {
  const globalWatchingChannelsArrKeys = Object.keys(globalWatchingChannels);
  const channelsToRemove = globalWatchingChannelsArrKeys.filter(
    (c) => !channelsKeys.includes(c)
  );
  channelsToRemove.forEach((c) => {
    console.log(`${new Date()}: ${c} ficou offline`);
    const channel = globalWatchingChannels[c];
    channel.page?.close();
    delete globalWatchingChannels[c];
  });
};

const updateChannelData = async ({
  browser,
}: {
  browser: puppeteer.Browser;
}) => {
  const channels = await getChannelsFromTwitch();
  const channelsKeys = Object.keys(channels);

  addChannels({ channels, channelsKeys, browser });
  removeChannels({ channelsKeys });
};

const startScript = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  try {
    updateChannelData({ browser });
    setInterval(() => {
      updateChannelData({ browser });
    }, 1000 * 60);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`${new Date()}: ${error.message}`);
      browser.close();
    }
    return 1;
  }
};

export default startScript;
