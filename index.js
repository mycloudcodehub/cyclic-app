const app = require('./src-back/routes');
// const { webhookCallback } = require("grammy");
const bot = require('./src-back/bot');



const PORT = process.env.PORT || 3000;





app.listen(PORT, () => {
  console.log(`| Bot work |Webligh runing at .... ${PORT} on ${process.env.NODE_ENV}` );
});