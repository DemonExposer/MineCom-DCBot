const {TextChannel} = require("discord.js");
const Net = require("net");

class MessageReceiver {
	#socketServer;
	#boundChannels;

	constructor(port) {
		this.#socketServer = new Net.Server();
		this.#boundChannels = [];

		this.#socketServer.listen(port, () => console.log(`Listening for messages on localhost:${port}`));
		this.#socketServer.on("connection", this.#onConnection.bind(this));
	}

	#onConnection(socket) {
		socket.on("data", chunk => this.#boundChannels.forEach(channel => {
			var jsonObj = JSON.parse(chunk.toString());
			var msg = (jsonObj["sender"] === undefined) ? jsonObj["message"] : `${jsonObj["sender"]}: ${jsonObj["message"]}`
			channel.send(msg);
		}));
	}

	/**
	 * Binds a text channel to the bound Minecraft server text chat
	 * @param {TextChannel} channel The channel to bind
	 */
	bindChannel(channel) {
		this.#boundChannels.push(channel);
	}

	/**
	 * Unbinds a text channel to the bound Minecraft server text chat
	 * @param {TextChannel} channel The channel to unbind
	 */
	unbindChannel(channel) {
		var elementIndex = this.#boundChannels.indexOf(channel);
		this.#boundChannels.splice(elementIndex, 1);
	}
}

module.exports = MessageReceiver;