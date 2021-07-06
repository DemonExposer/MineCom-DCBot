const {TextChannel} = require("discord.js");
const Net = require("net");

/**
 * A class which listens for messages over TCP and forwards them to Discord
 */
class MessageReceiver {
	#socketServer;
	#boundChannels;

	/**
	 * Opens a new server socket on a specified port
	 * @param {number} port The port the server socket should bind to
	 */
	constructor(port) {
		this.#socketServer = new Net.Server();
		this.#boundChannels = [];

		this.#socketServer.listen(port, () => console.log(`Listening for messages on localhost:${port}`));
		this.#socketServer.on("connection", this.#onConnection.bind(this));
	}

	/**
	 * Gets called when a message is received on the server socket and forwards said message
	 * to Discord
	 * @param {Net.Socket} socket 
	 */
	#onConnection(socket) {
		socket.on("data", chunk => this.#boundChannels.forEach(channel => {
			try {
				var jsonObj = JSON.parse(chunk.toString()); // A message will never be larger than a chunk can handle so this should be fine
				var msg = (jsonObj["sender"] === undefined) ? jsonObj["message"] : `**${jsonObj["sender"]}:** ${jsonObj["message"]}`
				channel.send(msg);
			} catch {
				console.log(`Invalid JSON: ${chunk.toString()}`);
				channel.send("Message data lost");
			}
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