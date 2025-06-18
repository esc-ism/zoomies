import Hideables from './copies';

import {DEGREES, getTheta} from '@/shared';

const getLeft = ({x}) => (0.5 + x) * 100;
const getTop = ({y}) => (0.5 - y) * 100;

export const setPosition = (position, element) => {
	element.style.left = `${getLeft(position)}%`;
	element.style.top = `${getTop(position)}%`;
};

export class Line {
	static getLines(points) {
		if (points.length < 2) {
			return [];
		}
		
		if (points.length === 2) {
			return [points];
		}
		
		const lines = [];
		
		let start = points[points.length - 1];
		
		for (const point of points) {
			lines.push([start, point]);
			
			start = point;
		}
		
		return lines;
	}
	
	static Reflection = class {
		constructor(source, flipX, flipY) {
			this.source = source;
			this.element = source.element.cloneNode();
			
			this.xProperty = flipX ? 'right' : 'left';
			this.yProperty = flipY ? 'bottom' : 'top';
			
			if (flipX) {
				this.element.style.translate = '50%';
			}
			
			if (flipY) {
				this.element.style.transformOrigin = 'center bottom';
			}
			
			this.flipRotation = flipX !== flipY;
		}
		
		setHeight() {
			this.element.style.height = `${this.source.height}%`;
		}
		
		setRotation() {
			this.element.style.rotate = `${this.flipRotation ? -this.source.rotation : this.source.rotation}rad`;
		}
		
		setPosition() {
			this.element.style[this.xProperty] = `${this.source.left}%`;
			this.element.style[this.yProperty] = `${this.source.top}%`;
		}
	};
	
	static template = document.createElement('div');
	
	static {
		this.template.style.pointerEvents = 'none';
		this.template.style.position = 'absolute';
		this.template.style.transformOrigin = 'top center';
		this.template.style.translate = '-50% 0';
		this.template.style.width = `${window.devicePixelRatio}px`;
	}
	
	element = (this.constructor.template ?? Line.template).cloneNode();
	reflections = [];
	
	constructor(demo, flipX, flipY, flipBoth, parent = demo.elements.imageWrapper) {
		this.parent = parent;
		this.demo = demo;
		
		const Reflection = this.constructor.Reflection ?? Line.Reflection;
		
		if (flipX) {
			this.reflections.push(new Reflection(this, true, false));
		}
		
		if (flipY) {
			this.reflections.push(new Reflection(this, false, true));
		}
		
		if (flipBoth) {
			this.reflections.push(new Reflection(this, true, true));
		}
		
		parent.append(this.element, ...this.reflections.map(({element}) => element));
	}
	
	remove() {
		this.element.remove();
		
		for (const {element} of this.reflections) {
			element.remove();
		}
	}
	
	front() {
		this.parent.append(this.element, ...this.reflections.map(({element}) => element));
	}
	
	deactivate(deactivateSelf = true) {
		for (const {element} of this.reflections) {
			element.style.visibility = 'hidden';
		}
		
		if (!deactivateSelf) {
			return;
		}
		
		this.element.style.visibility = 'hidden';
		
		this.set = () => {};
	}
	
	hide() {
		this.element.style.display = 'none';
		
		for (const {element} of this.reflections) {
			element.style.display = 'none';
		}
	}
	
	show() {
		this.element.style.removeProperty('display');
		
		for (const {element} of this.reflections) {
			element.style.removeProperty('display');
		}
	}
	
	setHeight(from, to) {
		const {ratioImage} = this.demo;
		
		this.height = Math.sqrt((to.x ? Math.pow((to.x - from.x) * ratioImage, 2) : 0) + (to.y ? Math.pow((to.y - from.y), 2) : 0)) * 100;
		
		this.element.style.height = `${this.height}%`;
		
		for (const reflection of this.reflections) {
			reflection.setHeight();
		}
	}
	
	setRotation(from, to) {
		const {ratioImage, ratioImageInverse} = this.demo;
		
		const ratioWidth = Math.max(1, ratioImage);
		const ratioHeight = Math.max(1, ratioImageInverse);
		
		this.rotation = DEGREES[270] - getTheta(
			from.x * ratioWidth,
			from.y * ratioHeight,
			(to.x ?? from.x) * ratioWidth,
			(to.y ?? from.y) * ratioHeight,
		);
		
		this.element.style.rotate = `${this.rotation}rad`;
		
		for (const reflection of this.reflections) {
			reflection.setRotation();
		}
	}
	
	setPosition(position) {
		this.left = getLeft(position);
		this.top = getTop(position);
		
		this.element.style.left = `${this.left}%`;
		this.element.style.top = `${this.top}%`;
		
		for (const reflection of this.reflections) {
			reflection.setPosition();
		}
	}
	
	set(from, to) {
		this.show();
		
		this.setHeight(from, to);
		
		this.setRotation(from, to);
		
		this.setPosition(from);
	}
}

export default class extends Hideables {
	constructor(count, ...args) {
		super();
		
		for (let i = 0; i < count; ++i) {
			this[i] = new Line(...args);
		}
	}
}
