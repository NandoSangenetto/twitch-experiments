#!/usr/bin/env node
import { program } from "commander";
import dotenv from "dotenv";

import { bots } from "./cli/data";
import browse from "./cli/browse";

dotenv.config();

program.description("Browse a bot:").action(browse);

bots.forEach((bot) => {
  program.command(bot.command).description(bot.description).action(bot.load);
});

program.parse(process.argv);
