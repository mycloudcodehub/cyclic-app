const app = require('./src-back/routes');
const bot = require('./src-back/bot');
var packageJson = require('./package.json');



const PORT = process.env.PORT || 3000;


app.listen(PORT, async () => {





  console.log(`App running...>> | Port: ${PORT} | Env: ${process.env.NODE_ENV} | Version: ${packageJson.version}` );
});