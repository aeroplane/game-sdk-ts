namespace PM {
	export class Client extends Base {
		constructor(win: Window = window.parent, origin: string = '*', scope: string = 'PM-Scope') {
			super(win, origin, scope);
		}
	}
}