import https from "https";
import colors from "colors";
import request from "../../../helpers/request";
import { getTimeNow } from "../../../helpers/time";
import { CommandType } from "../chatListener";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const brStreamer = async () => {
  const start = getTimeNow();
  try {
    await request("https://brstreamers.dev:8000/public/streams", {
      agent: httpsAgent,
    });
    const end = getTimeNow();
    return end - start;
  } catch (error) {
    console.log(error);

    return null;
  }
};

const commandBr = async ({ client, channel, username }: CommandType) => {
  const br = await brStreamer();
  if (br) {
    const msg = `PRIVMSG #${channel} :@${username} Acredita? O BrStreamers.Dev está online com ${br}ms.`;
    client.send(msg);
  } else {
    client.send(`PRIVMSG #${channel} :@${username} Ixi. Tá off.`);
  }
};

export default commandBr;
