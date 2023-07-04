const app = require('./src-back/routes');
const { webhookCallback } = require("grammy");
const express = require('express');
const bot = require('./src-back/bot');



const PORT = process.env.PORT || 3000;



// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  app.listen(PORT, () => {
    console.log(`Webligh runing at .... ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
  app.listen(PORT, () => {
    console.log(`Webligh runing at ....  ${PORT}`);
  });
}