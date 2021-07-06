const Discord = require("discord.js");
const client = new Discord.Client();
const MessageReceiver = require("./network/messageReceiver.js");
const MessageTransmitter = require("./network/messageTransmitter.js");

class Bot {
	#commands = ["--bindchannel", "--unbindchannel"].sort();
	#commandHelp = {
		"--bindchannel": "Binds this text channel to the MC server chat",
		"--unbindchannel": "Unbinds this text channel to the MC server chat"
	};
	#msgRecv;

	/**
	 * Creates a new instance of this bot
	 * @param {String} discordToken The bot token you got from discord
	 * @param {number} port The port the bot should listen on
	 */
	constructor(discordToken, port) {
		this.#msgRecv = new MessageReceiver(port);

		client.on("ready", () => {
			console.log("Connected as " + client.user.tag);
			client.user.setActivity("type --help for help");
		});

		client.on("message", this.#messageHandler.bind(this));

		client.login(discordToken);
	}

	/**
	 * @param {Discord.Message} msg
	 */
	#messageHandler(msg) {
		if (msg.author.bot)
			return;

		switch (msg.content) {
			case "--bindchannel":
				this.#msgRecv.bindChannel(msg.channel);
				break;
			case "--unbindchannel":
				this.#msgRecv.unbindChannel(msg.channel);
				break;
			case "--help":
				var response = "";
				this.#commands.forEach(commandStr => response += `\`${commandStr}\`: ${this.#commandHelp[commandStr]}\n`);
				msg.channel.send(response.slice(0, response.length-1));
				break;
			default:
				if (!this.#msgRecv.isBound(msg.channel))
					break;

				MessageTransmitter.transmit(
					"127.0.0.1",
					501,
					{
						sender: msg.member.displayName,
						message: msg.content
					}
				);
				break;
		}
	}
}

module.exports = Bot;