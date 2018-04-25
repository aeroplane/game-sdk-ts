namespace PM {
	export type TReadyCallback = (t?: Channel.MessagingChannel) => void;
	export type TListenerCallback = (...params: any[]) => Promise <any>;
	export type TChannelListenerCallback = (transaction: Channel.MessageTransaction, params: any) => void;

	export abstract class Base {
		protected channel: Channel.MessagingChannel;
		private readies: TReadyCallback[];

		constructor(win: Window, origin: string = '*', scope: string = 'PM-Scope')
		{
			this.readies = [];
			let t = this;
			this.channel = Channel.build({
				window: win,
				origin,
				scope,
				reconnect: true,
				onReady(channel: Channel.MessagingChannel) {
					//console.log('onReady', t);
					return t.callReadies(channel);
				}
			});
		}

		public ready(callback: TReadyCallback): Base {
			this.readies.push(callback);
			return this;
		}

		private callReadies(channel: Channel.MessagingChannel): void
		{
			this.readies.forEach(v => {
				if (typeof v == 'function') {
					v.call(this, channel);
				}
			});
		}

		public call(method: string, ...params: any[]): Promise<any> {

			return new Promise((resolve, reject) => {
				try{
					this.channel.call({
						method,
						params,
						success(v) { // when bind's closure returning, call success
							resolve(v);
						},
						error(error: any, message: string) {
							reject({error, message});
						}
					});
				} catch (e){
					reject(e);
				}
			});
		}

		public notify(message: Channel.Message) : void
		{
			this.channel.notify(message);
		}

		public bind(method: string, callback?: TChannelListenerCallback, doNotPublish?: boolean) : Channel.MessagingChannel
		{
			return this.channel.bind(method, callback);
		}

		public on(method: string, callback: TListenerCallback, doNotPublish?: boolean) : void
		{
			this.bind(method, (transaction, params) => {
				transaction.delayReturn(true);

				return promiseWrap(callback, ...params)
					.then(v => {
						transaction.complete(v);
					}).catch(err => {
						transaction.error(err, typeof err != 'undefined' ? err.toString() : null);
					});
			}, doNotPublish);
		}

		public off(method: string, doNotPublish ?: boolean) : boolean
		{
			return this.channel.unbind(method);
		}

		public unbind(method: string, doNotPublish?: boolean): boolean
		{
			return this.off(method, doNotPublish);
		}

		public destroy(): void
		{
			this.channel.destroy();
		}
	}
}