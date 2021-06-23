import { CustomValidator } from '@demo/app-common';

enum SupportMethods {
	POST = 'post',
	GET = 'get',
	PUT = 'put',
	PATCH = 'patch',
	DEL = 'delete',
	OPT = 'options'
};

interface ISubSetting {
	p: RegExp;
	m: Array<string>;
};

interface IIgnoreSetting {
	group: RegExp;
	regs: Array<ISubSetting>;
};

export class AppIgnoreHandler {

	static rules: Array<IIgnoreSetting> = [
		{
			group: /^\/api\/v[1-9]+\/account\/./,
			regs: [
				{ p: /.\/check$/, m: [SupportMethods.POST] }
			],
		},
		{
			group: /^\/mocks\/./,
			regs: [
				{ p: /.\/session$/, m: [] }
			],
		}
	];

	static ignore = (method: string, route: string): boolean => {
		if (method.toLowerCase() === SupportMethods.OPT) {
			return true;
		}

		if (!CustomValidator.nonEmptyString(method)) {
			return false;
		}
		if (!CustomValidator.nonEmptyString(route)) {
			return false;
		}
		const g = AppIgnoreHandler.rules.find((x) => x.group.test(route));
		if (!g) {
			return false;
		}
		const p = g.regs.find((x) => x.p.test(route));
		if (!p) {
			return false;
		}
		if (!CustomValidator.nonEmptyArray(p.m)) {
			return true;
		}
		return p.m.includes(method.toLowerCase());
	}
}
