import Hideable from './index';

import {DEGREES, getTheta} from '@/shared';

const template = document.createElement('div');

template.style.position = 'absolute';
template.style.transformOrigin = 'top center';
template.style.translate = '-50% 0';
template.style.width = `${window.devicePixelRatio}px`;

export const setPosition = ({x, y}, element) => {
	element.style.left = `${(0.5 + x) * 100}%`;
	element.style.top = `${(0.5 - y) * 100}%`;
};

export class Line {
	element = template.cloneNode();
	
	constructor(demo) {
		this.demo = demo;
	}
	
	hide() {
		this.element.style.display = 'none';
	}
	
	show() {
		this.element.style.removeProperty('display');
	}
	
	getHeight(from, to, {ratioImage}) {
		return Math.sqrt((to.x ? Math.pow((to.x - from.x) * ratioImage, 2) : 0) + (to.y ? Math.pow((to.y - from.y), 2) : 0)) * 100;
	}
	
	setRotation(from, to, {ratioImage, ratioImageInverse}) {
		const ratioWidth = Math.max(1, ratioImage);
		const ratioHeight = Math.max(1, ratioImageInverse);
		
		this.element.style.rotate = `${DEGREES[270] - getTheta(
			from.x * ratioWidth,
			from.y * ratioHeight,
			(to.x ?? from.x) * ratioWidth,
			(to.y ?? from.y) * ratioHeight,
		)}rad`;
	}
	
	setPosition(position) {
		setPosition(position, this.element);
	}
	
	set(from, to, demo = this.demo) {
		this.show();
		
		this.element.style.height = `${this.getHeight(from, to, demo)}%`;
		
		this.setRotation(from, to, demo);
		
		this.setPosition(from);
	}
}

export default class extends Hideable {
	constructor(demo, count = 4) {
		super();
		
		for (let i = 0; i < count; ++i) {
			this[i] = new Line(demo);
		}
	}
	
	set(points, demo) {
		if (points.length > 2) {
			let start = points[points.length - 1];
			
			this.hide(points.length);
			
			for (const [i, point] of points.entries()) {
				this[i].set(start, point, demo);
				
				start = point;
			}
		} else if (points.length === 2) {
			this.hide(1);
			
			this[0].set(points[0], points[1], demo);
		} else {
			this.hide();
			
			return;
		}
	}
}
