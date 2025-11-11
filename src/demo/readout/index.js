import elements from '../elements';

import {IDS, POSTFIXES, FORMATTERS, ID} from './consts';

import './css';

export default class {
	element = document.createElement('table');
	#valueElements = {};
	
	constructor() {
		this.element.id = ID;
		
		this.element.style.position = 'absolute';
		this.element.style.top = this.element.style.left = '0';
		this.element.style.userSelect = 'none';
		this.element.style.pointerEvents = 'none';
		this.element.style.whiteSpace = 'nowrap';
		this.element.style.borderCollapse = 'collapse';
		this.element.style.font = 'bold 16px "courier new", monospace';
		this.element.style.color = '#e5e5e5';
		this.element.style.textShadow = '0px 0px 5px black';
		
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
		
		elements.viewport.insertAdjacentElement('afterend', this.element);
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
