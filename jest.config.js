const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { defaults: tsjPreset } = require('ts-jest/presets');
const { compilerOptions } = require('./tsconfig.json');
const jestrc = require('./jestrc.json');

module.exports = {
	...jestrc,
	transform: {
		...tsjPreset.transform,
	},
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/packages' }),
};
