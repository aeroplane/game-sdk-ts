namespace SDK {

	function baseGet(object: any, path: string) {
		let _path = path.split('.');
		let index = 0,
			length = _path.length;

		while (object != null && index < length) {
			object = object[_path[index++]];
		}
		return (index && index == length) ? object : undefined;
	}
	function baseSet(object: any, path: string, value: any) {
		let _path = path.split('.');

		let index = -1,
			length = _path.length,
			nested = object;

		while (nested != null && ++index < length - 1) {
			let key = _path[index];
			if (typeof nested[key] == 'undefined')
				nested[key] = {};
			nested = nested[key];
		}
		nested[_path[index]] = value;
		return object;
	}

	class InnerConfigGetter {
		private static value: any = {};
		static get(path: string, defaultValue: any = null): any {
			let result = baseGet(InnerConfigGetter.value, path);
			return result === undefined ? defaultValue : result;
		}
		static set(k: string|Object, v?: any): void {
			if (v == null)
				InnerConfigGetter.value = v;
			else
				baseSet(InnerConfigGetter.value, k as string, v);
		}
	}

	export interface IClientConfig {
		client_id: string;
		access_token: string
	}

	export abstract class Base {
		protected pm: PM.Client|PM.Server|null = null;

		protected listening(callback?: (...params: any[]) => Promise<any>) {
			let cb = (_class: this, prop: PropertyKey) => {
				return typeof callback == 'function' ? callback : function (...params: any[]) {
					return _class.call(prop.toString(), ...params);
				};
			};
			let proxy = typeof Proxy != 'undefined' ? Proxy : ProxyPolyfill;
			return new proxy(this, {
				get(_class: any, prop: PropertyKey) {
					if (prop in _class) return _class[prop]; // normal case
					// __call
					return cb(_class, prop);
				}
			});
		}

		public ready(callback: PM.TReadyCallback): Base
		{
			this.pm!.ready(callback);
			return this;
		}

		protected observe() {
			for (let name in this) {
				let n: string = name.toString();
				if (!this.hasOwnProperty(name) && /^on[A-Z]/.test(n)) {
					this.on(n.substr(2, 1).toLowerCase() + n.substr(3), this[name]);
				}
			}
		}

		protected setConfig(k: string | Object, v?: any)
		{
			InnerConfigGetter.set(k, v);
		}

		protected compareConfig(k1: string, k2: string): number
		{
			let v1 = InnerConfigGetter.get(k1, null);
			let v2 = InnerConfigGetter.get(k2, k2);

			return v1 == v2 ? 0 : v1 > v2 ? 1 : -1;
		}

		public call(method: string, ...params: any[]): Promise<any> {
			return this.pm!.call(method, ...params);
		}

		public on(method: string, callback: PM.TListenerCallback): void {
			return this.pm!.on(method, (...params: any[]) => {
				return callback.apply(this, params);
			});
		}

		public off(method: string): any
		{
			return this.off(method);
		}
	}
}