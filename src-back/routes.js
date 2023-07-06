// routes.js
const express = require("express");
const engine = require("ejs");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static
var options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["html", "css", "js", "ico", "jpg", "jpeg", "png", "svg"],
  index: ["index.html"],
  // index: false,
  maxAge: "1m",
  redirect: false,
};
app.use(express.static("public", options));

// ejs
app.engine("html", engine.__express);
app.set("views", path.join(__dirname, "../public"));
app.set("view engine", "html");

// bot
const bot = require("./bot");
const { webhookCallback } = require("grammy");
const webhookPath = process.env.TELEGRAM_WEBHOOK; // The path where Telegram will send updates
if (process.env.NODE_ENV === "production") {
  // app.use(express.json());
  app.use(webhookPath, webhookCallback(bot));
} else {
  bot.start();
}

// api
const router = express.Router();
const routes = require("./api/crud")(router, {});
app.use("/api", routes);

// site
// app.get("/", async function (req, res) {
//   res.render("index");
// });
// Catch all handler for all other request.

router.get('/update-webhook', async (req, res) => {
  try {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const TELEGRAM_WEBHOOK_FULL_URL = process.env.TELEGRAM_WEBHOOK_FULL_URL;

    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${TELEGRAM_WEBHOOK_FULL_URL}`);

    res.status(200).json({ message: 'Webhook updated successfully', response: response.data });
  } catch (error) {
    console.error('Webhook update failed:', error.message);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});


app.use("*", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});



module.exports = app;