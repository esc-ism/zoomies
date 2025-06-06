import './css';

import {IDS, POSTFIXES, PRETTIFIERS, ID} from './consts';

export default class {
	element = document.createElement('table');
	#valueElements = {};
	
	constructor() {
		this.element.id = ID;
		
		this.element.style.position = 'absolute';
		this.element.style.bottom = '0';
		this.element.style.userSelect = 'none';
		this.element.style.pointerEvents = 'none';
		this.element.style.whiteSpace = 'nowrap';
		this.element.style.textShadow = 'black 0 0 1px';
		this.element.style.backgroundColor = '#00000073';
		this.element.style.borderCollapse = 'collapse';
		this.element.style.borderColor = 'white';
		this.element.style.borderStyle = 'solid';
		this.element.style.borderWidth = '2px 2px 0 0';
		this.element.style.fontFamily = 'courier-new, monospace';
		this.element.style.fontSize = '0.9em';
		
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
	}
	
	#set(label, value) {
		this.#valueElements[label].innerText = `${PRETTIFIERS[label](value)}${POSTFIXES[label] ?? ''}`;
	}
	
	setPosition({x, y}) {
		this.#set(IDS.X, x);
		this.#set(IDS.Y, y);
	}
	
	setZoom(value) {
		this.#set(IDS.ZOOM, value);
	}
	
	setRotation(value) {
		this.#set(IDS.ANGLE, value);
	}
}
