import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import os from 'os';
import { customArgvs } from './custom-argvs';
import * as tracer from './custom-request-tracer';

const _ALLOW_CONSOLE_ENV = ['development', 'test'];

const _hostName = os.hostname().toLowerCase();
const _timePrinter = format.timestamp({
	format: 'YYYY-MM-DD HH:mm:ss',
});
const _msgPrinter = format.printf((info) => {
	const id = tracer.getId();
	return id
		? `${info['timestamp']} ${info.level} [${id}] - ${info.message}`
		: `${info['timestamp']} ${info.level} - ${info.message}`;
});
const _basicFormatter = format.combine(_timePrinter, _msgPrinter);

const _dailyFile = new transports.DailyRotateFile({
	auditFile: `${customArgvs.logpath}/${_hostName}.json`,
	filename: `${_hostName}.log.%DATE%`,
	dirname: customArgvs.logpath,
	maxFiles: '14d',
	// maxSize: '10m',
	level: 'info',
	format: _basicFormatter,
});
const _consoleLog = new transports.Console({
	level: _ALLOW_CONSOLE_ENV.includes(process.env['NODE_ENV'] || 'test') ? 'info' : 'error',
	format: _basicFormatter,
});

export const logger = createLogger()
	.add(_dailyFile)
	.add(_consoleLog);
