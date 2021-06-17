import * as uuid from 'uuid';
import * as lodash from 'lodash';

const _BASIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const _COMPLEX_CHARS = `${_BASIC_CHARS}!@#$%&*.+-;`;
const _NUMS = '0123456789';
const _SALT_ROUNDS = 9;

function _generateRandomValues(len: number, chars: string): string {
	const buf: string[] = [];
	for (let i = 0; i < len; i++) {
		buf.push(chars[Math.floor(Math.random() * chars.length)]);
	}
	return buf.join('');
}

/** Describe custom utils */
export class CustomUtils {

	/** 
   * Sleep in seconds
   * @param inSeconds Sleep in seconds
   * @returns void
   */
	public static async sleep(inSeconds: number): Promise<void> {
		return new Promise((res) => {
			setTimeout(() => {
				return res();
			}, inSeconds * 1000);
		});
	}

	/**
   * Convert string to base64
   * @param str Input string to encode
   * @returns encoded string
   */
	public static fromStringToBase64(str: string): string {
		return Buffer.from(str).toString('base64');
	}

	/** 
   * Convert base64 string to ascii string
   * @param str Input string to decode
   * @returns decoded string
   */
	public static fromBase64ToString(str = ''): string {
		return Buffer.from(str, 'base64').toString('utf-8');
	}

	/** 
   * Generate numeric string with input length
   * @param len length to generate, default to 9
   * @returns string
   */
	public static generateRandomNumbers(len: number = _SALT_ROUNDS): string {
		return _generateRandomValues(len, _NUMS);
	}

	/**
   * Generate random string with input length
   * @param len length to generate, default to 9
   * @returns string
   */
	public static generateRandomString(len = _SALT_ROUNDS): string {
		return _generateRandomValues(len, _BASIC_CHARS);
	}

	/** 
   * Generate random string with symbols with input length
   * @param len length to generate, default to 9
   * @returns string
   */
	public static generateComplexRandomString(len = _SALT_ROUNDS): string {
		return _generateRandomValues(len, _COMPLEX_CHARS);
	}

	/** 
   * Generate a random string based on uuid
   * @returns string of uuid v4
   */
	public static generateUUIDV4(): string {
		return uuid.v4();
	}

	/**
   * Generate unique id
   * @returns string of unique id
   */
	public static generateUniqueId(): string {
		return this.fromStringToBase64(this.generateUUIDV4());
	}

	/**
   * Deep copy
   * @returns {object}
   */
	public static deepClone(obj: any) {
		return lodash.cloneDeep(obj);
	}
}
