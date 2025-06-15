import Hideables from './copies';

import {Line} from './lines';

class Rail extends Line {
	static getBackgroundImage(progress, doMirror) {
		return `linear-gradient(${doMirror ? 'to top, ' : ''}red 0, red ${progress * 100}%, lime 0, lime 100%)`;
	}
	
	static Reflection = class extends Line.Reflection {
		constructor(source, flipX, flipY) {
			super(source, flipX, flipY);
			
			this.flipImage = flipY;
		}
		
		setProgress(progress) {
			this.element.style.backgroundImage = Rail.getBackgroundImage(progress, this.flipImage);
		}
	};
	
	setProgress(progress) {
		this.element.style.backgroundImage = Rail.getBackgroundImage(progress);
		
		for (const reflection of this.reflections) {
			reflection.setProgress(progress);
		}
	}
}

export default class extends Hideables {
	constructor(count, ...args) {
		super();
		
		for (let i = 0; i < count; ++i) {
			this[i] = new Rail(...args);
		}
	}
	
	setProgress(...progresses) {
		for (const [i, progress] of progresses.entries()) {
			this[i].setProgress(progress);
		}
	}
}
