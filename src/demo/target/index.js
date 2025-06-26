import {Connection, setPosition} from '../lines/lines';
import {setLineStyle} from '../bounds';

import {DEGREES} from '@/shared';
import {CROSSHAIR} from '../elements';

export default class {
	element = document.createElement('div');
	crosshair = CROSSHAIR.cloneNode(true);
	
	constructor(demo) {
		this.demo = demo;
		
		this.element.style.display = 'contents';
		
		this.element.append(this.crosshair);
		
		this.line = new Connection(demo, false, false, false, this.element);
		
		this.crosshair.style.opacity = this.line.element.style.opacity = '0.4';
		this.crosshair.style.position = 'absolute';
		
		this.crosshair.style.color = 'white';
		
		setLineStyle(this.line.element);
		
		this.hide();
	}
	
	hide() {
		this.crosshair.style.display = this.line.element.style.display = 'none';
	}
	
	set(target) {
		const {position, zoom, rotation} = this.demo;
		
		if ((!target.x || target.x === position.x) && (!target.y || target.y === position.y)) {
			this.hide();
			
			return;
		}
		
		this.crosshair.style.removeProperty('display');
		this.line.element.style.removeProperty('display');
		
		this.line.set(position, target);
		
		setPosition({x: target.x ?? position.x, y: target.y ?? position.y}, this.crosshair);
		
		this.crosshair.style.scale = `${1 / zoom}`;
		this.crosshair.style.rotate = `${rotation - DEGREES[90]}rad`;
	}
}
