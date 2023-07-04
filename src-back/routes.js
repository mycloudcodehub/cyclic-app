// routes.js
const express = require("express");
const CyclicDb = require("@cyclic.sh/dynamodb");
const db = CyclicDb(process.env.CYCLIC_DB);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bot = require("./bot");
const { webhookCallback } = require("grammy");

// ################## BOT ###############################################

const webhookPath = '/telegram-webhook'; // The path where Telegram will send updates

if (process.env.NODE_ENV === "production") {
  app.use(express.json());
  app.use(webhookPath, webhookCallback(bot));
} else {
  bot.start();
}

// #############################################################################
var options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html", "css", "js", "ico", "jpg", "jpeg", "png", "svg"],
  index: ["index.html"],
  maxAge: "1m",
  redirect: false,
};
app.use(express.static("public", options));
// #############################################################################

// Create or Update an item

app.post("/:col/:key", async (req, res) => {
  console.log(req.body);

  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).set(key, req.body);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Delete an item
app.delete("/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).delete(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Get a single item
app.get("/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} get key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).get(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Get a full listing
app.get("/:col", async (req, res) => {
  const col = req.params.col;
  console.log(
    `list collection: ${col} with params: ${JSON.stringify(req.params)}`
  );
  const items = await db.collection(col).list();
  console.log(JSON.stringify(items, null, 2));
  res.json(items).end();
});
// #############################################################################

// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.json({ msg: "No way" }).end();
});

// Export the app instance
module.exports = app;
