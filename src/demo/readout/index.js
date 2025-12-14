import elements from '../elements';

import {IDS, POSTFIXES, FORMATTERS, ID} from './consts';

import './css';

export default class {
	container = document.createElement('div');
	element = document.createElement('table');
	#valueElements = {};
	
	constructor() {
		this.element.id = ID;
		
		this.container.style.position = 'absolute';
		this.container.style.top = this.container.style.left = '0';
		this.container.style.userSelect = 'none';
		this.container.style.pointerEvents = 'none';
		this.container.style.maxWidth = '100%';
		this.container.style.overflow = 'hidden';
		
		this.element.style.textWrapMode = 'nowrap';
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
		this.container.appendChild(this.element);
		
		elements.viewport.insertAdjacentElement('afterend', this.container);
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
