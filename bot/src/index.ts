#!/usr/bin/env node
import { program } from "commander";

import { bots } from "./cli/data";
import browse from "./cli/browse";

program.description("Browse a bot:").action(browse);

bots.forEach((bot) => {
  program.command(bot.command).description(bot.description).action(bot.load);
});

program.parse(process.argv);
