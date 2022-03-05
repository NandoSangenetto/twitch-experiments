import { CommandType } from "../chatListener";

const commandTeAmo = ({ client, channel, username }: CommandType) => {
  if (Math.random() > 0.5) {
    client.send(`PRIVMSG #${channel} :Eu também te amo, @${username}! <3`);
  } else {
    client.send(
      `PRIVMSG #${channel} :Mas eu não, @${username}! nandos16Snibmoto `
    );
  }
};

export default commandTeAmo;
