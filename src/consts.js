import {getId} from './shared/css';

export const CLASS_WRAPPER = getId('wrapper');

export const inputListener = new class {
	#id = 'isMouse';
	#isMouse = JSON.parse(localStorage.getItem(this.#id)) ?? window.matchMedia('(pointer: fine)').matches;
	#listeners = [];
	
	set(value) {
		this.#isMouse = value;
		
		localStorage.setItem(this.#id, value);
		
		for (const listener of this.#listeners) {
			listener(value);
		}
	}
	
	add(listener, doCall = true) {
		this.#listeners.push(listener);
		
		if (doCall) {
			listener(this.#isMouse);
		}
	}
}();
