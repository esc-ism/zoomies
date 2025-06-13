import Lines from './lines/lines';

export const setLineStyle = (() => {
	const length = 6;
	const gap = 8;
	const value = `repeating-linear-gradient(transparent, white 0, white ${length}px, transparent 0, transparent ${length + gap}px)`;
	
	return (element) => {
		element.style.backgroundImage = value;
	};
})();

export default class {
	element = document.createElement('div');
	background = document.createElement('div');
	lines = new Lines();
	
	constructor() {
		this.element.style.height = this.element.style.width = '100%';
		this.element.style.pointerEvents = 'none';
		
		this.background.style.height = this.background.style.width = '100%';
		this.background.style.position = 'absolute';
		this.background.style.backgroundColor = '#000000a0';
		
		this.element.appendChild(this.background);
		
		for (const {element} of this.lines) {
			setLineStyle(element);
			
			this.element.appendChild(element);
		}
	}
	
	show(doShow = true) {
		if (doShow) {
			this.background.style.removeProperty('display');
		} else {
			this.background.style.display = 'none';
		}
	}
	
	set(demo, ...points) {
		this.lines.set(points, demo);
		
		if (points.length < 2) {
			this.background.style.removeProperty('clip-path');
			
			return;
		}
		
		const path = points.map(({x, y}) => `${x * 100 + 50}% ${50 - y * 100}%`);
		
		this.background.style.clipPath = `polygon(0 0, 0 100%, 100% 100%, 100% 0, 0 0, ${[...path, path[0]].join(',')})`;
	}
}
