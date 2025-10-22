import {gsap} from 'gsap';

import elements from '../elements';

const getColour = (() => {
	const low = {threshold: 0.15};
	const high = {threshold: 0.05};
	
	for (const data of [low, high]) {
		data.mult = 510 / (1 - data.threshold * 2);
	}
	
	const get = (progress, {threshold, mult}) => progress <= threshold ? 0 : Math.round((progress - threshold) * mult);
	
	return (progress) => progress < 0.5 ? `rgb(255 ${get(progress, low)} 0)` : `rgb(${get(1 - progress, high)} 255 0)`;
})();

export default class {
	element = document.createElement('div');
	
	constructor() {
		this.element.style.position = 'absolute';
		this.element.style.bottom = '0';
		this.element.style.left = '0';
		this.element.style.height = '5px';
		this.element.style.width = '0';
		
		const values = {};
		
		this.timeline = gsap.timeline({paused: true})
			.fromTo(values, {blur: 0, opacity: 1}, {blur: 2, opacity: 0, duration: 0.5, ease: 'none'})
			.eventCallback('onUpdate', () => {
				this.element.style.opacity = `${values.opacity}`;
				this.element.style.filter = `blur(${values.blur}px)`;
			})
			.eventCallback('onUpdate', () => {
				this.element.style.opacity = `${values.opacity}`;
				this.element.style.filter = `blur(${values.blur}px)`;
			});
		
		elements.viewport.appendChild(this.element);
	}
	
	reset() {
		this.element.style.width = '0';
		
		this.timeline.progress(0).pause();
	}
	
	set(value) {
		this.element.style.backgroundColor = getColour(value);
		
		this.element.style.width = `${value * 100}%`;
	}
	
	complete() {
		this.timeline.play();
	}
}
