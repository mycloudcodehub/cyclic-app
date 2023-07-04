const app = require('./src-back/routes');
const bot = require('./src-back/bot');
const fs = require("fs");
const path = require("path");



const PORT = process.env.PORT || 3000;


app.listen(PORT, async () => {
  let hash;
  try {
    hash = await fs.promises.readFile(path.join(__dirname, ".git/refs/heads/master"));
    console.log(hash.toString().trim());
  } catch (error) {
    console.error("Error reading file:", error);
  }
  console.log(`App running: | Port: ${PORT} | Env: ${process.env.NODE_ENV} | Hash when start: ${hash} ` );
});