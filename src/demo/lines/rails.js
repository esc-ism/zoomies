import Hideables from './copies';

import {Line} from './lines';

const getBackgroundImage = (() => {
	const lowColour = '#a00';
	const highColour = '#0a0';
	
	return (progress, doMirror) => `linear-gradient(${doMirror ? 'to top, ' : ''}${lowColour} 0, ${lowColour} ${progress * 100}%, ${highColour} 0, ${highColour} 100%)`;
})();

class Rail extends Line {
	static Reflection = class extends Line.Reflection {
		constructor(source, flipX, flipY) {
			super(source, flipX, flipY);
			
			this.flipImage = flipY;
		}
		
		setProgress(progress) {
			this.element.style.backgroundImage = getBackgroundImage(progress, this.flipImage);
		}
	};
	
	// static template = Line.template.cloneNode();
	
	// static {
	// 	this.template.style.borderColor = 'white';
	// 	this.template.style.borderStyle = 'solid';
	// 	this.template.style.borderWidth = '0 1px';
	// }
	
	setProgress(progress) {
		this.element.style.backgroundImage = getBackgroundImage(progress);
		
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
		const ordered = [];
		
		const addToOrdered = (progress, index) => {
			for (const [i, orderedIndex] of ordered.entries()) {
				if (progresses[orderedIndex] >= progress) {
					ordered.splice(i, 0, index);
					
					return;
				}
			}
			
			ordered.push(index);
		};
		
		for (const [i, progress] of progresses.entries()) {
			this[i].setProgress(progress);
			
			addToOrdered(progress, i);
		}
		
		// where rails overlap, show the one that farther progressed
		for (const i of ordered.slice(1)) {
			this[i].front();
		}
	}
}
