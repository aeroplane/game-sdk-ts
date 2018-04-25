function promiseWrap(callback: Function, ...args: any[]): Promise<any> {
	return Promise.resolve(callback.call(this, ...args));
}
/**
 * only one parameter
 * @param args
 */
function promiseReject(args?: any): Promise<any> {
	return Promise.reject(args);
}

