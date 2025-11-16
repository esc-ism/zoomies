import demo from '@/demo';
import {DEGREES} from '@/shared';

import {Connection, setPosition} from './lines/lines';
import {setLineStyle} from './bounds';
import elements from './elements';

export default class {
	element = document.createElement('div');
	crosshair = elements.crosshair.cloneNode(true);
	
	#isHidden = true;
	
	constructor() {
		this.element.style.display = 'contents';
		this.element.style.pointerEvents = 'none';
		
		this.line = new Connection(false, false, false, this.element);
		
		this.element.appendChild(this.crosshair);
		
		this.crosshair.style.opacity = this.line.element.style.opacity = '0.4';
		this.crosshair.style.position = 'absolute';
		
		this.crosshair.style.color = 'white';
		
		setLineStyle(this.line.element);
		
		elements.imageContainer.appendChild(this.element);
		
		this.hide();
	}
	
	isHidden() {
		return this.#isHidden;
	}
	
	hide() {
		this.crosshair.style.display = this.line.element.style.display = 'none';
		
		this.#isHidden = true;
	}
	
	set({x, y}) {
		const {position, zoom, rotation} = demo;
		
		if (x === position.x && y === position.y) {
			this.hide();
			
			return;
		}
		
		this.crosshair.style.removeProperty('display');
		this.line.element.style.removeProperty('display');
		
		this.line.set(position, {x, y});
		
		setPosition({x, y}, this.crosshair);
		
		this.crosshair.style.scale = `${1 / zoom}`;
		this.crosshair.style.rotate = `${rotation - DEGREES[90]}rad`;
		
		this.#isHidden = false;
	}
}
