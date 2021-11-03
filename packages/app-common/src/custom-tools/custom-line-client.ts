import { Client, ClientConfig } from '@line/bot-sdk';
import { ILineClient } from '../custom-types';
import { logger as LOGGER } from '../custom-tools/custom-logger';

export class CustomLineClient implements ILineClient {
	private _client: Client;
	private _config: ClientConfig;
	private _richMenus: Set<string> = new Set();

	constructor(config: ClientConfig, richMenus: string[] = []) {
		if (!config) {
			throw new Error('Line config is null');
		}
		if (!config.channelAccessToken || config.channelAccessToken.length === 0) {
			throw new Error('Line channelAccessToken is empty');
		}
		if (!config.channelSecret || config.channelSecret.length === 0) {
			throw new Error('Line channelSecret is empty');
		}
		this._config = config;
		this._client = new Client(this._config);
		richMenus.forEach(x => this._richMenus.add(x));
	}

	linkRichMenuToUser = async (id: string, menuId: string): Promise<void> => {
		if (!id || id.length === 0) {
			LOGGER.error('Target line id is empty');
			return;
		}
		if (!this._richMenus.has(menuId)) {
			LOGGER.error('Target menu id is empty');
			return;
		}

		await this._client.linkRichMenuToUser(id, menuId);
	}

	pushTextToUsers = async (to: string[], message: string): Promise<boolean> => {
		if (!to || to.length === 0) {
			LOGGER.error('Target line id is empty');
			return false;
		}
		if (!message || message.length === 0) {
			LOGGER.error('Line message is empty');
			return false;
		}
		await this._client.multicast(to, { type: 'text', text: message });
		return true;
	}
}
