# MineCom-DCBot
A Discord bot connecting a text channel to a Minecraft server's text chat using https://github.com/DemonExposer/MineCom-Plugin<br/>
<br/>
Install with:
```
npm install minecom-dcbot
```
then run it like this:
```js
const Bot = require("minecom-dcbot");
new Bot(<BOT TOKEN> [, port for MessageReceiver = 500] [, IP address of plugin = "127.0.0.1"] [, port of plugin = 501]);
```
