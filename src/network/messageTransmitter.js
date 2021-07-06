const Net = require("net");

class MessageTransmitter {
	/**
	 * Transmits a message over TCP
	 * @param {String} address The host to send the message to
	 * @param {number} port The host's port
	 * @param {Object} message A JSON object representing the message to send
	 */
	static transmit(address, port, message) {
		var socket = new Net.Socket();
		socket.connect(port, address, () => socket.write(JSON.stringify(message)));
		socket.on("close", _ => socket.destroy());
	}
}

module.exports = MessageTransmitter;