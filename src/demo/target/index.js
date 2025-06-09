import {DEGREES, getTheta} from '@/shared';

import {CROSSHAIR} from '../elements';

export default class {
	element = document.createElement('div');
	crosshair = CROSSHAIR.cloneNode(true);
	line = document.createElement('div');
	
	constructor() {
		this.element.style.display = 'contents';
		
		this.element.append(this.crosshair, this.line);
		
		this.crosshair.style.opacity = this.line.style.opacity = '0.4';
		this.crosshair.style.position = this.line.style.position = 'absolute';
		
		this.crosshair.style.color = 'white';
		
		this.line.style.transformOrigin = 'top center';
		this.line.style.translate = '-50% 0';
		this.line.style.width = '2px';
		this.line.style.backgroundImage = 'repeating-linear-gradient(transparent, white 0, white 5px, transparent 0, transparent 10px)';
		
		this.hide();
	}
	
	hide() {
		this.crosshair.style.display = this.line.style.display = 'none';
	}
	
	set(target, {position, ratioWidth, ratioHeight, zoom, rotation}) {
		if ((!target.x || target.x === position.x) && (!target.y || target.y === position.y)) {
			this.hide();
			
			return;
		}
		
		this.crosshair.style.removeProperty('display');
		this.line.style.removeProperty('display');
		
		this.crosshair.style.left = `${(0.5 + (target.x ?? position.x)) * 100}%`;
		this.crosshair.style.top = `${(0.5 - (target.y ?? position.y)) * 100}%`;
		this.crosshair.style.scale = `${1 / zoom}`;
		this.crosshair.style.rotate = `${rotation - DEGREES[90]}rad`;
		
		this.line.style.height = `${Math.sqrt((target.x ? Math.pow((target.x - position.x) * ratioWidth, 2) : 0)
			+ (target.y ? Math.pow((target.y - position.y) * ratioHeight, 2) : 0)) * 100}%`;
		this.line.style.rotate = `${DEGREES[270] - getTheta(
			position.x * ratioWidth,
			position.y * ratioHeight,
			(target.x ?? position.x) * ratioWidth,
			(target.y ?? position.y) * ratioHeight,
		)}rad`;
		this.line.style.left = `${(0.5 + position.x) * 100}%`;
		this.line.style.top = `${(0.5 - position.y) * 100}%`;
	}
}
