import { webhookCallback } from "grammy";

import { createBot } from "../src/bot";

const bot = createBot();

export default webhookCallback(bot, "std/http");
