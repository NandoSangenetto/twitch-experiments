import colors from "colors";
import { bots } from "./data";

export default () => {
  console.log("AVALIABLE BOTS");
  console.log("------------------");

  bots.forEach((bot) => {
    console.log("%s", colors.bold(bot.name));
  });
};
