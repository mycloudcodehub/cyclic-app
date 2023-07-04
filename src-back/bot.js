const { Bot, InlineKeyboard } = require("grammy");
const { chunk } = require("lodash");
const { applyTextEffect } = require("./textEffects");

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// Handle the /yo command to greet the user
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from.username}`));

bot.command("srv", (ctx) => {
  const NODE_ENV = process.env.NODE_ENV;
  ctx.reply(`Yo ${ctx.from.username} ${NODE_ENV}`);
});

// Handle the /effect command to apply text effects using an inline keyboard
const allEffects = [
  { code: "w", label: "Monospace" },
  { code: "b", label: "Bold" },
  { code: "i", label: "Italic" },
  { code: "d", label: "Doublestruck" },
  { code: "o", label: "Circled" },
  { code: "q", label: "Squared" },
];

const effectCallbackCodeAccessor = (effectCode) => `effect-${effectCode}`;

const effectsKeyboardAccessor = (effectCodes) => {
  const effectsAccessor = (effectCodes) =>
    effectCodes.map((code) =>
      allEffects.find((effect) => effect.code === code)
    );
  const effects = effectsAccessor(effectCodes);

  const keyboard = new InlineKeyboard();
  const chunkedEffects = chunk(effects, 3);
  for (const effectsChunk of chunkedEffects) {
    for (const effect of effectsChunk) {
      effect &&
        keyboard.text(effect.label, effectCallbackCodeAccessor(effect.code));
    }
    keyboard.row();
  }

  return keyboard;
};

const textEffectResponseAccessor = (originalText, modifiedText) =>
  `Original: ${originalText}` +
  (modifiedText ? `\nModified: ${modifiedText}` : "");

const parseTextEffectResponse = (response) => {
  const originalText = response.match(/Original: (.*)/)[1];
  const modifiedTextMatch = response.match(/Modified: (.*)/);

  let modifiedText;
  if (modifiedTextMatch) modifiedText = modifiedTextMatch[1];

  if (!modifiedTextMatch) return { originalText };
  else return { originalText, modifiedText };
};

bot.command("effect", (ctx) =>
  ctx.reply(textEffectResponseAccessor(ctx.match), {
    reply_markup: effectsKeyboardAccessor(
      allEffects.map((effect) => effect.code)
    ),
  })
);

// Handle inline queries
const queryRegEx = /effect (monospace|bold|italic) (.*)/;
bot.inlineQuery(queryRegEx, async (ctx) => {
  const fullQuery = ctx.inlineQuery.query;
  const fullQueryMatch = fullQuery.match(queryRegEx);
  if (!fullQueryMatch) return;

  const effectLabel = fullQueryMatch[1];
  const originalText = fullQueryMatch[2];

  const effectCode = allEffects.find(
    (effect) => effect.label.toLowerCase() === effectLabel.toLowerCase()
  ).code;
  const modifiedText = applyTextEffect(originalText, effectCode);

  await ctx.answerInlineQuery([
    {
      type: "article",
      id: "text-effect",
      title: "Text Effects",
      input_message_content: {
        message_text: `Original: ${originalText}\nModified: ${modifiedText}`,
        parse_mode: "HTML",
      },
      reply_markup: new InlineKeyboard().switchInline("Share", fullQuery),
      url: "http://t.me/EludaDevSmarterBot",
      description: "Create stylish Unicode text, all within Telegram.",
    },
  ]);
});

// Return empty result list for other queries.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));

// Handle text effects from the effect keyboard
for (const effect of allEffects) {
  const allEffectCodes = allEffects.map((effect) => effect.code);

  bot.callbackQuery(effectCallbackCodeAccessor(effect.code), async (ctx) => {
    const { originalText } = parseTextEffectResponse(ctx.msg.text || "");
    const modifiedText = applyTextEffect(originalText, effect.code);

    await ctx.editMessageText(
      textEffectResponseAccessor(originalText, modifiedText),
      {
        reply_markup: effectsKeyboardAccessor(
          allEffectCodes.filter((code) => code !== effect.code)
        ),
      }
    );
  });
}

// Handle the /about command
const aboutUrlKeyboard = new InlineKeyboard().url(
  "Host your own bot for free.",
  "https://cyclic.sh/"
);

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
  {
    command: "effect",
    description: "Apply text effects on the text. (usage: /effect [text])",
  },
]);

// Handle all other messages and the /start command
const introductionMessage = `A Weblight Product.

<b>Commands</b>
/yo - Be greeted by me
/effect [text] - Show a keyboard to apply text effects to [text]`;

const replyWithIntro = (ctx) =>
  ctx.reply(introductionMessage, {
    reply_markup: aboutUrlKeyboard,
    parse_mode: "HTML",
  });

bot.command("start", replyWithIntro);
bot.on("message", replyWithIntro);

// Export the bot instance
module.exports = bot;
