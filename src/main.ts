import { createBot } from "./bot";
import { createLogger } from "./util/logger";

const log = createLogger("main");

const bot = createBot();

export const runApp = () => {
  log.info("starting Telegram bot");
  bot.start();
};
