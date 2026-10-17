import type { VercelRequest, VercelResponse } from "@vercel/node";
import { webhookCallback } from "grammy";
import { createBot } from "../src/bot";

const bot = createBot();

const handleUpdate = webhookCallback(bot, "http");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    return handleUpdate(req, res);
  }
  return res.status(200).send("Bot server is running.");
}
