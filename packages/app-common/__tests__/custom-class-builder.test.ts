import { CustomClassBuilder } from '../src/custom-tools/custom-class-builder';
import { CustomJsonProp } from '../src/custom-tools/custom-decorators/custom-json-prop';

describe('Custom class builder test', () => {
	test('Should be undefined', (done) => {
		expect(CustomClassBuilder.build()).toBeUndefined();
		done();
	});
	test('Should success w/o decorator', (done) => {
		class TestRequest {
      public name: string = '';
      public age: number = 0;
      constructor() {
      }
      public checkRequired(): TestRequest {
      	return this;
      }
		}
		const obj = {
			name: 'xxxhand',
			age: 20,
			aka: 'ssss',
		};
		const req = CustomClassBuilder.build(TestRequest, obj);

		expect(req).toBeTruthy();
		expect(req?.name).toBe(obj.name);
		expect(req?.age).toBe(obj.age);
		expect(req?.checkRequired()).toBeInstanceOf(TestRequest);
		done();
	});
	test('Should success w/ decorator', (done) => {
		class Address {
      public street: string = '';
      public county: string = '';
		}
		class TestRequest {
      public name: string = '';
      @CustomJsonProp({ name: 'my-age' })
      public age: number = 0;
      @CustomJsonProp({ name: 'test-addr', clazz: Address })
      public address: Address[] = [];
			@CustomJsonProp({ name: 'my-gender' })
			public gender: number = 2;

			public checkRequired(): TestRequest {
      	return this;
			}
		}
		const obj = {
			name: 'xxxhand',
			['my-age']: 20,
			['test-addr']: [
				{
					street: 'aaa',
					county: 'tao',
				},
				{
					street: 'bbb',
					county: 'tpe',
				}
			],
		};
		const req = CustomClassBuilder.build(TestRequest, obj);

		expect(req).toBeTruthy();
		expect(req?.name).toBe(obj.name);
		expect(req?.age).toBe(obj['my-age']);
		expect(req?.address).toHaveLength(2);
		expect(req?.gender).toBe(2);
		const [ad1, ad2] = req?.address || [];
		expect(ad1).toBeTruthy();
		expect(ad1.county).toBe('tao');
		expect(ad1.street).toBe('aaa');
		expect(ad2).toBeTruthy();
		expect(ad2.county).toBe('tpe');
		expect(ad2.street).toBe('bbb');
		expect(req?.checkRequired()).toBeInstanceOf(TestRequest);
		done();
	});
	test('Should success w/ different key length', (done) => {
		class Person {
			public name: string = '';
			public age: number = 0;
			public gender: number = 1;
		};

		const obj: { name: string, age: number } = {
			name: 'xxxhand',
			age: 10,
		};

		const buildPerson = <Person>CustomClassBuilder.build(Person, obj);
		expect(buildPerson).toBeTruthy();
		expect(buildPerson.age).toBe(obj.age);
		expect(buildPerson.name).toBe(obj.name);
		expect(buildPerson.gender).toBe(1);
		done();
	});
});
