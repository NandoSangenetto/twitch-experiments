import inquirer from "inquirer";
import colors from "colors";
import pad from "pad";

import { bots, botNames } from "./data";

const questions = [
  {
    type: "list",
    name: "bot",
    message: "Choose a bot:",
    choices: botNames,
  },
];

export default async () => {
  const answers = await inquirer.prompt(questions);
  const [chosenBot] = bots.filter((bot) => bot.name == answers.bot);
  console.log(pad(colors.blue("Running: "), 30), chosenBot.name);
  console.log(pad(colors.blue("Description: "), 30), chosenBot.description);
  chosenBot.load();
};
