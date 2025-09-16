import './css';

import {IDS, POSTFIXES, FORMATTERS, ID} from './consts';

export default class {
	element = document.createElement('table');
	#valueElements = {};
	
	constructor(demo) {
		this.element.id = ID;
		
		this.element.style.position = 'absolute';
		this.element.style.top = this.element.style.left = '0';
		this.element.style.userSelect = 'none';
		this.element.style.pointerEvents = 'none';
		this.element.style.whiteSpace = 'nowrap';
		this.element.style.backgroundColor = '#000000a0';
		this.element.style.borderCollapse = 'collapse';
		this.element.style.boxShadow = 'black 0 0 6px 1px';
		this.element.style.fontFamily = 'courier-new, monospace';
		this.element.style.fontSize = '16px';
		
		const body = document.createElement('tbody');
		
		for (const label of Object.values(IDS)) {
			const row = document.createElement('tr');
			const cell = document.createElement('td');
			
			this.#valueElements[label] = document.createElement('td');
			
			cell.innerText = label;
			
			row.append(cell, this.#valueElements[label]);
			
			body.appendChild(row);
		}
		
		this.element.appendChild(body);
		
		demo.elements.resizer.parentElement.insertBefore(this.element, demo.elements.resizer);
	}
	
	#set(label, value) {
		this.#valueElements[label].innerText = `${FORMATTERS[label](value)}${POSTFIXES[label] ?? ''}`;
	}
	
	setPosition({position: {x, y}}) {
		this.#set(IDS.X, x);
		this.#set(IDS.Y, y);
	}
	
	setZoom({zoom}) {
		this.#set(IDS.ZOOM, zoom);
	}
	
	setRotation({rotation}) {
		this.#set(IDS.ANGLE, rotation);
	}
	
	setRatio({ratio}) {
		this.#set(IDS.RATIO, ratio);
	}
}
