import elements from '@/demo/elements';

import Hideables from './copies';
import {Connection} from './lines';

const getBackgroundImage = (() => {
	const lowColour = '#700';
	const highColour = '#080';
	
	return (progress, doMirror) => `linear-gradient(${doMirror ? 'to top, ' : ''}${lowColour} 0, ${lowColour} ${progress * 100}%, ${highColour} 0, ${highColour} 100%)`;
})();

class Rail extends Connection {
	static Reflection = class extends Connection.Reflection {
		constructor(source, flipX, flipY) {
			super(source, flipX, flipY);
			
			this.flipImage = flipY;
		}
		
		setProgress(progress) {
			this.element.style.backgroundImage = getBackgroundImage(progress, this.flipImage);
		}
	};
	
	setProgress(progress) {
		this.element.style.backgroundImage = getBackgroundImage(progress);
		
		for (const reflection of this.reflections) {
			reflection.setProgress(progress);
		}
	}
}

export default class extends Hideables {
	constructor(count, flipX, flipY, flipBoth) {
		super();
		
		for (let i = 0; i < count; ++i) {
			this[i] = new Rail(flipX, flipY, flipBoth, elements.rail);
		}
	}
	
	setProgress(...progresses) {
		const ordered = [];
		
		const addToOrdered = (progress, index) => {
			for (const [i, [, orderedProgress]] of ordered.entries()) {
				if (orderedProgress >= progress) {
					ordered.splice(i, 0, [index, progress]);
					
					return;
				}
			}
			
			ordered.push([index, progress]);
		};
		
		for (const [i, progress] of progresses.entries()) {
			this[i].setProgress(progress);
			
			addToOrdered(progress * this[i].element.clientHeight, i);
		}
		
		// where rails overlap, show the higher progressed
		for (const [i] of ordered.slice(1)) {
			this[i].front();
		}
	}
}
