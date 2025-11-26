import {getId} from './shared/css';

export const CLASS_WRAPPER = getId('wrapper');

export const CLASS_SEMANTIC_BUTTON = getId('button');

export const inputListener = new class {
	#id = 'isMouse';
	#isMouse = JSON.parse(localStorage.getItem(this.#id)) ?? window.matchMedia('(pointer: fine)').matches;
	#listeners = [];
	
	get isMouse() {
		return this.#isMouse;
	}
	
	set(value) {
		this.#isMouse = value;
		
		localStorage.setItem(this.#id, value);
		
		for (const listener of this.#listeners) {
			listener();
		}
	}
	
	add(listener, doCall = true) {
		this.#listeners.push(listener);
		
		if (doCall) {
			listener();
		}
	}
}();
