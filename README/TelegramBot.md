## set webhook where telegram will send data

# run in cli

`export TELEGRAM_WEBHOOK_URL=https://weblight.cyclic.app/telegram-webhook
export TELEGRAM_TOKEN= ... from .env`

`curl "https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook?url=$TELEGRAM_WEBHOOK_URL"`
