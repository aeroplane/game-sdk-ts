namespace SDK {

	export class Server extends Base {

		public ajax: LP.http.jQueryAjax|LP.http.axiosAjax;

		constructor(iFrameWindow: Window, origin: string)
		{
			super();
			this.pm = new PM.Server(iFrameWindow, origin);

			this.observe();
			this.ajax = new LP.http.jQueryAjax();
			return this.listening();
		}

		public init(client_id: string)
		{
			this.setConfig('server', { client_id });
		}

		protected onSyncClientConfig(config: IClientConfig)
		{
			this.setConfig('client', config);

			if (this.compareConfig('client.client_id', 'server.client_id') !== 0)
				throw new Error('[ServerFailure] Client\'s client_id is **NOT** equal to Server\'s client_id.');

			this.ajax.setHeader('Authorization', 'Bearer ' + config.access_token);
			return 0;
		}


	}
}