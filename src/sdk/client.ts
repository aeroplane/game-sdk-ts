namespace SDK {

	export class Client extends Base {
		constructor(domain: string, win: Window = window.parent)
		{
			super();
			if (!domain || /\//.test(domain))
				throw new Error('Client Failure: domain must be set. domain must without http[s]:// or any /');

			//if (/[\?&]code=/i.test(window.location.href))
			//	throw new Error(`Client Failure: \nYour location.href include "code=". You must use the "code" to exchange the "access_token" from the server, then redirect a url without "code=". \n您当前网址中含有"code="，您需要先使用"code"换取"access_token"，然后跳转到不含有"code"的网址中。`);

			this.pm = new PM.Client(win, window.location.protocol + '//' + domain + '/');
			this.observe();
			return this.listening();
		}

		public init(client_id: string, access_token: string)
		{
			let config = { client_id, access_token } as IClientConfig;

			this.ready(() => this.call('syncClientConfig', config));
		}
	}
}