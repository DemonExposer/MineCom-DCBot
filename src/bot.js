const Discord = require("discord.js");
const fs = require("fs");
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
	#txAddress;
	#txPort;
	#BOUND_CHANNELS_FILE = "bound_channels.json";

	/**
	 * Creates a new instance of this bot
	 * @param {String} discordToken The bot token you got from discord
	 * @param {number} rxPort The port the bot should listen on
	 * @param {String} txAddress The host name of the plugin
	 * @param {number} txPort The port the plugin is listening on
	 */
	constructor(discordToken, rxPort = 500, txAddress = "127.0.0.1", txPort = 501) {
		this.#txAddress = txAddress;
		this.#txPort = txPort;
		this.#msgRecv = new MessageReceiver(rxPort, this.#BOUND_CHANNELS_FILE);

		client.on("ready", () => {
			console.log("Connected as " + client.user.tag);
			client.user.setActivity("type --help for help");
			
			// Reads from this.#BOUND_CHANNELS_FILE and if it doesn't exist, it creates it, if it does exist, it binds all the channels
			fs.stat(this.#BOUND_CHANNELS_FILE, (err, _) => (err != null) ? fs.writeFile(this.#BOUND_CHANNELS_FILE, "[]", err => err && console.log(err)) : fs.readFile(this.#BOUND_CHANNELS_FILE, (_, data) => JSON.parse(data.toString()).forEach(async channelID => this.#msgRecv.bindChannel(await client.channels.fetch(channelID)))));
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
					this.#txAddress,
					this.#txPort,
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