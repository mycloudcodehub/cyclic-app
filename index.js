const { webhookCallback } = require("grammy");
const express = require('express');
const bot = require('./src-back/bot');
const app = require('./src-back/routes');



const PORT = process.env.PORT || 3000;



// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
}