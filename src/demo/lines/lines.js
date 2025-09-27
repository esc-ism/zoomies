import Hideables from './copies';

import {DEGREES, getTheta} from '@/shared';

const getLeft = ({x}) => (0.5 + x) * 100;
const getTop = ({y}) => (0.5 - y) * 100;

export const setPosition = (position, element) => {
	element.style.left = `${getLeft(position)}%`;
	element.style.top = `${getTop(position)}%`;
};

export class Line {
	static Reflection = class {
		constructor({element}, flipX, flipY) {
			this.element = element.cloneNode();
			
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
		
		setHeight(height) {
			this.element.style.height = `${height}%`;
		}
		
		setRotation(rotation) {
			this.element.style.rotate = `${this.flipRotation ? -rotation : rotation}rad`;
		}
		
		setPosition(left, top) {
			this.element.style[this.xProperty] = `${left}%`;
			this.element.style[this.yProperty] = `${top}%`;
		}
	};
	
	static template = document.createElement('div');
	
	static {
		this.template.style.pointerEvents = 'one';
		this.template.style.position = 'absolute';
		this.template.style.transformOrigin = 'top center';
		this.template.style.translate = '-50% 0';
		this.template.style.width = `${window.devicePixelRatio}px`;
	}
	
	element = (this.constructor.template ?? Line.template).cloneNode();
	reflections = [];
	
	constructor(demo, flipX, flipY, flipBoth, parent = demo.constructor.elements.imageWrapper) {
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
	
	setHeight(height) {
		this.element.style.height = `${height}%`;
		
		for (const reflection of this.reflections) {
			reflection.setHeight(height);
		}
	}
	
	setRotation(rotation) {
		const adjustedRotation = DEGREES[270] - rotation;
		
		this.element.style.rotate = `${adjustedRotation}rad`;
		
		for (const reflection of this.reflections) {
			reflection.setRotation(adjustedRotation);
		}
	}
	
	setPosition(from) {
		const left = getLeft(from);
		const top = getTop(from);
		
		this.element.style.left = `${left}%`;
		this.element.style.top = `${top}%`;
		
		for (const reflection of this.reflections) {
			reflection.setPosition(left, top);
		}
	}
}

export class Connection extends Line {
	setHeight(from, to) {
		const {ratioImage} = this.demo;
		
		const xSquared = to.x ? Math.pow((to.x - from.x) * ratioImage, 2) : 0;
		const ySquared = to.y ? Math.pow((to.y - from.y), 2) : 0;
		
		super.setHeight(Math.sqrt(xSquared + ySquared) * 100);
	}
	
	setRotation(from, to) {
		const {ratioImage, ratioImageInverse} = this.demo;
		
		const ratioWidth = Math.max(1, ratioImage);
		const ratioHeight = Math.max(1, ratioImageInverse);
		
		super.setRotation(getTheta(
			(to.x ?? from.x) * ratioWidth,
			(to.y ?? from.y) * ratioHeight,
			from.x * ratioWidth,
			from.y * ratioHeight,
		));
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
			this[i] = new Connection(...args);
		}
	}
}
