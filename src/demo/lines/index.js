export default class extends Array {
	hide(from = 0) {
		for (let i = from; i < this.length; ++i) {
			this[i].hide();
		}
	}
}
