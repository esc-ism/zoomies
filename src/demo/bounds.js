import elements from '@/demo/elements';
import Hideables from './lines/copies';
import {Connection} from './lines/lines';

export const setLineStyle = (() => {
	const length = 6;
	const gap = 8;
	const value = `repeating-linear-gradient(transparent, white 0, white ${length}px, transparent 0, transparent ${length + gap}px)`;
	
	return (element) => {
		element.style.backgroundImage = value;
	};
})();

class BoundLine extends Connection {
	static template = Connection.template.cloneNode();
	
	static {
		setLineStyle(this.template);
	}
}

class BoundLines extends Hideables {
	constructor(count, ...args) {
		super();
		
		for (let i = 0; i < count; ++i) {
			this[i] = new BoundLine(...args);
		}
	}
}

export default class {
	background = document.createElement('div');
	
	constructor() {
		this.background.style.height = this.background.style.width = '100%';
		this.background.style.position = 'absolute';
		this.background.style.backgroundColor = '#00000030';
		
		elements.boundLimit.appendChild(this.background);
		
		this.line1D = new BoundLine(false, false, false, elements.boundLine);
		this.lines2D = new BoundLines(2, false, false, true, elements.boundLine);
	}
	
	remove() {
		this.background.remove();
		
		this.line1D.remove();
		this.lines2D.remove();
	}
	
	show(doShow = true) {
		if (doShow) {
			this.background.style.removeProperty('display');
		} else {
			this.background.style.display = 'none';
		}
	}
	
	set(...points) {
		if (points.length > 2) {
			const path = points.map(({x, y}) => `${x * 100 + 50}% ${50 - y * 100}%`);
			
			this.background.style.clipPath = `polygon(0 0, 0 100%, 100% 100%, 100% 0, 0 0, ${[...path, path[0]].join(',')})`;
			
			this.line1D.hide();
			this.lines2D.set([points[0], points[1]], [points[1], points[2]]);
			
			return;
		}
		
		this.lines2D.hide();
		
		this.background.style.removeProperty('clip-path');
		
		if (points.length === 2) {
			this.line1D.set(...points);
		} else {
			this.line1D.hide();
		}
	}
}
