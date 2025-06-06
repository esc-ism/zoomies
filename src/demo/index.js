import './css';

import {getTheta, DEGREES} from '@/shared';

import Readout from './readout';
import LimitDisplay from './limitDisplay';

import getElements from './elements';

import {ALLOWANCE_CLICK, MULTIPLIERS_SCROLL} from './consts';

export const WEIGHTS = {
	DIMENSIONS: 0,
	ROTATION: 0,
	ZOOM: 1,
	POSITION: 2,
};

const dock = (node) => new Promise((resolve) => {
	const observer = new ResizeObserver(() => {
		if (node.isConnected) {
			observer.disconnect();
			
			// webpack gives me an error without the delay 🤷‍♂️
			window.setTimeout(resolve, 0);
		}
	});
	
	observer.observe(node);
});

export default class {
	static limitDisplay = new LimitDisplay();
	static readout = new Readout();
	
	elements = getElements();
	
	element = this.elements.wrapper;
	
	imageDimensions = {};
	viewportDimensions = {};
	
	position = {x: 0, y: 0};
	rotation = DEGREES[90];
	zoom = 1;
	
	constructor() {
		const {wrapper, viewport, image, resizer, imageWrapper} = this.elements;
		
		this.constructor.readout.setPosition(this.position);
		this.constructor.readout.setZoom(this.zoom);
		this.constructor.readout.setRotation(this.rotation);
		
		resizer.parentElement.insertBefore(this.constructor.readout.element, resizer);
		imageWrapper.appendChild(this.constructor.limitDisplay.element);
		
		dock(wrapper).then(() => {
			const observer = new ResizeObserver(() => {
				if (!this.element.isConnected) {
					observer.disconnect();
					
					return;
				}
				
				this.updateImageDimensions(false);
				this.updateViewportDimensions();
				
				this.constrainPosition(WEIGHTS.DIMENSIONS);
			});
			
			observer.observe(wrapper.parentElement);
		});
		
		resizer.addEventListener('pointerdown', (event) => {
			if (event.button !== 0) {
				return;
			}
			
			event.stopPropagation();
			event.preventDefault();
			
			const {offsetX} = event;
			
			const moveCallback = (event) => {
				wrapper.style.width = `${(event.clientX - offsetX) / wrapper.parentElement.clientWidth * 100}%`;
				
				this.updateViewportDimensions();
			};
			
			resizer.setPointerCapture(event.pointerId);
			
			resizer.addEventListener('pointermove', moveCallback);
			resizer.addEventListener('pointerup', () => {
				resizer.removeEventListener('pointermove', moveCallback);
			});
		});
		
		viewport.addEventListener('wheel', (event) => {
			event.stopPropagation();
			event.preventDefault();
			
			if (event.deltaY === 0) {
				return;
			}
			
			const increment = event.deltaY * MULTIPLIERS_SCROLL[event.deltaMode] / -1000;
			
			if (increment > 0) {
				this.zoom *= 1 + increment;
			} else {
				this.zoom /= 1 - increment;
			}
			
			this.constrainPosition(WEIGHTS.ZOOM);
			
			this.applyPosition();
			this.applyZoom();
			
			// setTargetX(newPosition.x);
			// setTargetY(newPosition.y);
		});
		
		viewport.addEventListener('pointerdown', (event) => {
			const {offsetX, offsetY, buttons, clientX, clientY} = event;
			
			if (buttons !== 1 && buttons !== 2) {
				return;
			}
			
			event.stopPropagation();
			event.preventDefault();
			
			const listener = buttons === 1 ? this.getPanListener() : this.getRotateListener();
			
			this.elements.viewport.addEventListener('pointermove', listener);
			
			image.style.cursor = 'grabbing';
			
			let isClick = buttons !== 1 || image.isSameNode(event.target);
			
			image.setPointerCapture(event.pointerId);
			
			const clickNegater = (event) => {
				if (Math.abs(event.clientX - clientX) > ALLOWANCE_CLICK || Math.abs(event.clientY - clientY) > ALLOWANCE_CLICK) {
					isClick = false;
					
					image.removeEventListener('pointermove', clickNegater);
				}
			};
			
			if (isClick) {
				image.addEventListener('pointermove', clickNegater);
			}
			
			image.addEventListener('pointerup', () => {
				image.removeEventListener('pointermove', clickNegater);
				
				image.style.removeProperty('cursor');
				
				this.elements.viewport.removeEventListener('pointermove', listener);
				
				if (buttons === 2) {
					window.addEventListener('contextmenu', (event) => {
						event.stopPropagation();
						event.preventDefault();
					}, {capture: true, once: true});
				}
				
				// setTargetX(null);
				// setTargetY(null);
				
				if (!isClick) {
					return;
				}
				
				if (buttons === 1) {
					this.position.x = (offsetX / this.imageDimensions.width) - 0.5;
					this.position.y = (-offsetY / this.imageDimensions.height) + 0.5;
					
					this.constrainZoom();
					
					this.applyZoom();
					this.applyPosition();
				} else {
					this.reset();
				}
			}, {once: true});
		});
	}
	
	setDimensions(data, {offsetWidth, offsetHeight}) {
		data.width = offsetWidth;
		data.height = offsetHeight;
		
		data.halfWidth = data.width / 2;
		data.halfHeight = data.height / 2;
	}
	
	updateImageDimensions(doApply = true) {
		this.setDimensions(this.imageDimensions, this.elements.image);
		
		this.constructor.limitDisplay.setDimensions(this.elements.image);
		
		this.ratioWidth = Math.min(1, this.imageDimensions.width / this.imageDimensions.height);
		this.ratioHeight = Math.min(1, this.imageDimensions.height / this.imageDimensions.width);
		
		if (doApply) {
			this.constrainPosition(WEIGHTS.DIMENSIONS);
			this.applyPosition();
		}
	}
	
	updateViewportDimensions(doApply = true) {
		this.setDimensions(this.viewportDimensions, this.elements.viewport);
		
		if (doApply) {
			this.constrainPosition(WEIGHTS.DIMENSIONS);
			this.applyPosition();
		}
	}
	
	reset() {
		this.position.x = 0;
		this.position.y = 0;
		this.zoom = 1;
		this.rotation = DEGREES[90];
		
		this.applyPosition();
		this.applyZoom();
		this.applyRotation();
		
		this.constrainPosition(WEIGHTS.ROTATION);
	}
	
	getPanListener() {
		let priorEvent;
		
		const change = {x: 0, y: 0};
		
		return ({offsetX, offsetY}) => {
			if (priorEvent) {
				change.x = priorEvent.offsetX + change.x - offsetX;
				change.y = change.y + offsetY - priorEvent.offsetY;
				
				this.position.x += change.x / this.imageDimensions.width;
				this.position.y += change.y / this.imageDimensions.height;
				
				// setTargetX(target.x);
				// setTargetY(target.y);
				
				this.constrainPosition(WEIGHTS.POSITION);
				
				this.applyPosition();
			}
			
			// events in firefox seem to lose their data after finishing propagation
			// so assigning the whole event doesn't work
			priorEvent = {offsetX, offsetY};
		};
	}
	
	getRotateListener() {
		const {left, top} = this.elements.viewport.getBoundingClientRect();
		const middleX = left + this.viewportDimensions.halfWidth;
		const middleY = top + this.viewportDimensions.halfHeight;
		
		let priorMouseTheta;
		let startRotation = this.rotation;
		
		return (event) => {
			const mouseTheta = getTheta(middleX, middleY, event.clientX, event.clientY);
			
			if (priorMouseTheta === undefined) {
				priorMouseTheta = mouseTheta;
				
				return;
			}
			
			this.rotation = startRotation + (priorMouseTheta - mouseTheta);
			
			this.constrainRotation();
			this.constrainPosition(WEIGHTS.ROTATION);
			
			this.applyRotation();
			this.applyPosition();
		};
	}
	
	constrainRotation() {
		this.rotation %= DEGREES[360];
		
		if (this.rotation > DEGREES[90]) {
			this.rotation -= DEGREES[360];
		} else if (this.rotation <= -DEGREES[270]) {
			this.rotation += DEGREES[360];
		}
	}
	
	applyPosition() {
		this.elements.imageWrapper.style.translate = `${-this.position.x * 100}% ${this.position.y * 100}%`;
		this.elements.imageWrapper.style.transformOrigin = `${(0.5 + this.position.x) * 100}% ${(0.5 - this.position.y) * 100}%`;
		
		this.constructor.readout.setPosition(this.position);
	}
	
	applyZoom() {
		this.elements.imageWrapper.style.scale = `${this.zoom}`;
		
		this.constructor.readout.setZoom(this.zoom);
	}
	
	applyRotation() {
		this.elements.imageWrapper.style.rotate = `${DEGREES[90] - this.rotation}rad`;
		
		this.constructor.readout.setRotation(this.rotation);
	}
	
	setWidth(ratio) {
		const targetWidth = this.imageDimensions.width * ratio;
		
		this.element.style.width = `${targetWidth / this.element.parentElement.clientWidth * 100}%`;
		
		this.updateViewportDimensions();
	}
}
