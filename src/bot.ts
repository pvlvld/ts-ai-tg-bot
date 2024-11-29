import { Bot, matchFilter } from "grammy";
import type { IContext } from "./types/context.js";
import cfg from "./cfg.js";
import { parseMode } from "@grammyjs/parse-mode";
import { autoThread } from "@grammyjs/auto-thread";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot<IContext>(cfg.BOT_TOKEN);
bot.api.config.use(parseMode("HTML"));
bot.drop(matchFilter(":is_automatic_forward"));
bot.use(autoThread());
bot.use(autoQuote({ allowSendingWithoutReply: true }));

export { bot };
