import {getId} from './shared/css';

export const CLASS_WRAPPER = getId('wrapper');

export const InputMethod = new class {
	#id = 'isMouse';
	#isMouse = JSON.parse(localStorage.getItem(this.#id)) ?? window.matchMedia('(pointer: fine)').matches;
	#listeners = [];
	
	set isMouse(value) {
		this.#isMouse = value;
		
		localStorage.setItem(this.#id, value);
		
		for (const listener of this.#listeners) {
			listener(value);
		}
	}
	
	get isMouse() {
		return this.#isMouse;
	}
	
	addListener(listener) {
		this.#listeners.push(listener);
	}
}();
