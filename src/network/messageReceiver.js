const {TextChannel} = require("discord.js");
const Net = require("net");

/**
 * A class which listens for messages over TCP and forwards them to Discord
 */
class MessageReceiver {
	#socketServer;
	#boundChannels;
	#buffer = "";

	/**
	 * Opens a new server socket on a specified port
	 * @param {number} port The port the server socket should bind to
	 */
	constructor(port) {
		this.#socketServer = new Net.Server();
		this.#boundChannels = [];

		this.#socketServer.listen(port, () => console.log(`Listening for messages on localhost:${port}`));
		this.#socketServer.on("connection", this.#onConnection.bind(this));

		setInterval(this.#messageSender.bind(this), 1001); // Makes sure the time between two messages sent is > 1s
	}

	/**
	 * Sends the message in the buffer to Discord and clears the buffer
	 */
	#messageSender() {
		if (this.#buffer === "")
			return;

		var tempBuffer = this.#buffer;
		this.#buffer = "";
		this.#boundChannels.forEach(channel => channel.send(tempBuffer.slice(0, tempBuffer.length-1)));
	}

	/**
	 * Gets called when a message is received on the server socket and adds said message
	 * to the buffer
	 * @param {Net.Socket} socket 
	 */
	#onConnection(socket) {
		socket.on("data", chunk => {
			try {
				var jsonObj = JSON.parse(chunk.toString()); // A message will never be larger than a chunk can handle so this should be fine
				var msg = (jsonObj["sender"] === undefined) ? jsonObj["message"] : `**${jsonObj["sender"]}:** ${jsonObj["message"]}`;
				this.#buffer += `${msg}\n`;
			} catch {
				console.log(`Invalid JSON: ${chunk.toString()}`);
				this.#buffer += "Message data lost\n";
			}
		});
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

	/**
	 * Checks if a certain channel is bound to the bound Minecraft server text chat
	 * @param {TextChannel} channel The channel to check
	 */
	isBound(channel) {
		return this.#boundChannels.indexOf(channel) != -1;
	}
}

module.exports = MessageReceiver;