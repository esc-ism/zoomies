import Hideable from './index';
import {Line} from './lines';

class Rail extends Line {
	setProgress(progress) {
		this.element.style.backgroundImage = `linear-gradient(transparent, red 0, red ${progress * 100}%, lime 0, lime 100%)`;
	}
}

export default class extends Hideable {
	constructor(demo, flipX = false, flipY = true, count = 2) {
		super();
		
		this.flipX = flipX;
		this.flipY = flipY;
		
		this.reflections = 1 * (flipX ? 2 : 1) * (flipY ? 2 : 1);
		
		for (let i = count * this.reflections - 1; i >= 0; --i) {
			this[i] = new Rail(demo);
			
			demo.elements.imageWrapper.appendChild(this[i].element);
		}
	}
	
	setProgress(...progresses) {
		let i = 0;
		
		for (const progress of progresses) {
			for (let j = 0; j < this.reflections; ++j) {
				this[i++].setProgress(progress);
			}
		}
	}
	
	set(...lines) {
		this.hide(lines.length * this.reflections);
		
		let i = 0;
		
		for (const [from, to] of lines) {
			this[i++].set(from, to);
			
			if (this.flipX) {
				this[i++].set({x: -from.x, y: from.y}, {x: -to.x, y: to.y});
			}
			
			if (this.flipY) {
				this[i++].set({x: from.x, y: -from.y}, {x: to.x, y: -to.y});
			}
			
			if (this.flipX && this.flipY) {
				this[i++].set({x: -from.x, y: -from.y}, {x: -to.x, y: -to.y});
			}
		}
	}
}
