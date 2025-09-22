import Demo from '@/demo';

export default class extends Demo {
	actionPromises = {};
	
	constructor() {
		super();
		
		const listeners = {...this.listeners};
		
		for (const key of Object.keys(listeners)) {
			this.listeners[key] = (...args) => {
				this.actionPromises[key]?.();
				
				return listeners[key](...args);
			};
		}
	}
	
	constrainPosition() {}
	
	constrainZoom() {}
}
