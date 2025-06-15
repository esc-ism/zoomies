export default class extends Array {
	hide(from = 0) {
		for (let i = from; i < this.length; ++i) {
			this[i].hide();
		}
	}
	
	set(...argsList) {
		this.hide(argsList.length);
		
		for (const [i, args] of argsList.entries()) {
			this[i].set(...args);
		}
	}
}
