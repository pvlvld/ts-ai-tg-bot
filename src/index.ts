import { GrammyError, HttpError } from "grammy";
import { model, session } from "./AI/index.js";
import { bot } from "./bot.js";

process.on("uncaughtException", function (err) {
    console.error("You Shall Not Pass!");
    console.error(err);
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

const allowed_updates = [
    "message",
    "chat_member",
    "my_chat_member",
    "callback_query",
    "edited_message",
] as const;

function main() {
    const groupBot = bot.chatType(["group", "supergroup"]);
    const groupBotCall = groupBot.filter(
        (ctx) => !!ctx.msg?.text?.toLowerCase().startsWith("фелікс")
    );
    groupBotCall.on("message", async (ctx) => {
        const text = ctx.msg?.text;
        if (!text) return;
        const uid = String(ctx.from.username || ctx.from.id);
        const prompt = `${uid}: ${text}`;
        console.info(`${ctx.chat.username ?? ctx.chat.id} - ${prompt}`);
        let answer = await session.prompt(prompt, {
            onToken: (tokens) => process.stdout.write(model.detokenize(tokens)),
            repeatPenalty: { frequencyPenalty: 0.7, presencePenalty: 0.5 },
            temperature: 0.5,
            topP: 0.6,
        });
        answer = answer.replace(/<\.*\>/g, "");
        await ctx.reply(answer).catch(console.error);
    });

    groupBot.on("message", async (ctx) => {
        if (ctx.msg.reply_to_message?.from?.id === bot.botInfo.id) {
            const text = ctx.msg.text;
            if (!text) return;
            const uid = String(ctx.from.username || ctx.from.id);
            const prompt = `${uid}: ${text}\nУ відповідь на твоє повідомлення: ${ctx.msg
                .reply_to_message.text!}`;
            console.info(`${ctx.chat.username ?? ctx.chat.id} - ${prompt}`);
            let answer = await session.prompt(prompt, {
                onToken: (tokens) => process.stdout.write(model.detokenize(tokens)),
            });
            answer = answer.replace(/<\.*\>/g, "");
            await ctx.reply(answer).catch(console.error);
        }
    });
    console.log(`\nStarted!\nUsing model: ${model.filename}\n`);
    bot.start({ allowed_updates, drop_pending_updates: true });
}

main();
