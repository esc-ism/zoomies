import {gsap} from 'gsap';

import './css';

import {getTheta, DEGREES} from '@/shared';

import Readout from './readout';
import LimitDisplay from './limitDisplay';
import Target from './target';
import Progress from './progress';

import getElements from './elements';

import {ALLOWANCE_CLICK, MULTIPLIERS_SCROLL} from './consts';

export const WEIGHTS = {
	RATIO: -1,
	ROTATION: 0,
	ZOOM: 1,
	POSITION: 2,
};

const cancelRightClick = () => {
	window.addEventListener('contextmenu', (event) => {
		event.stopPropagation();
		event.preventDefault();
	}, {capture: true, once: true});
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
	static target = new Target();
	static progress = new Progress();
	
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
		
		viewport.appendChild(this.constructor.progress.element);
		resizer.parentElement.insertBefore(this.constructor.readout.element, resizer);
		imageWrapper.append(this.constructor.limitDisplay.element, this.constructor.target.element);
		
		dock(wrapper).then(() => {
			const observer = new ResizeObserver(() => {
				if (!this.element.isConnected) {
					observer.disconnect();
					
					return;
				}
				
				this.updateImageDimensions(false);
				this.updateViewportDimensions();
				
				if (this.setLimits) {
					this.constructor.limitDisplay.show();
					
					this.setLimits();
				} else {
					this.constructor.limitDisplay.show(false);
				}
			});
			
			observer.observe(wrapper.parentElement);
		});
		
		resizer.addEventListener('pointerdown', (event) => {
			const {buttons, offsetX} = event;
			
			if (buttons !== 1 && buttons !== 2) {
				return;
			}
			
			event.stopPropagation();
			event.preventDefault();
			
			const moveCallback = (event) => {
				viewport.style.aspectRatio = `${(event.clientX - offsetX) / this.viewportDimensions.height}`;
				
				this.updateViewportDimensions();
			};
			
			resizer.setPointerCapture(event.pointerId);
			
			resizer.addEventListener('pointermove', moveCallback);
			resizer.addEventListener('pointerup', () => {
				if (buttons === 2) {
					cancelRightClick();
					
					viewport.style.aspectRatio = '1';
					
					this.updateViewportDimensions();
				}
				
				resizer.removeEventListener('pointermove', moveCallback);
			}, {once: true});
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
					cancelRightClick();
				}
				
				this.constructor.target.hide();
				
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
			this.constrainPosition(WEIGHTS.RATIO);
			this.applyPosition();
		}
	}
	
	updateViewportDimensions(doApply = true) {
		this.setDimensions(this.viewportDimensions, this.elements.viewport);
		
		if (doApply) {
			this.constrainPosition(WEIGHTS.RATIO);
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
				
				const target = {...this.position};
				
				this.constrainPosition(WEIGHTS.POSITION);
				
				this.constructor.target.set(target, this);
				
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
			
			const target = {...this.position};
			
			this.constrainRotation();
			this.constrainPosition(WEIGHTS.ROTATION);
			
			this.constructor.target.set(target, this);
			
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
	
	setWidth(ratio, tween) {
		if (tween) {
			const value = {value: this.viewportDimensions.width / this.viewportDimensions.height};
			const travel = Math.abs(value.value - ratio) * this.viewportDimensions.height / window.screen.availWidth;
			
			if (travel > 0.05) {
				this.constructor.progress.reset();
				
				const demo = this;
				
				this.tween?.kill();
				
				return this.tween = gsap
					.to(value, {value: ratio, ease: 'bounce.out', duration: Math.min(2, travel * 10), ...typeof tween === 'object' ? tween : {}})
					.eventCallback('onUpdate', function () {
						demo.elements.viewport.style.aspectRatio = `${value.value}`;
						
						demo.updateViewportDimensions();
						
						demo.constructor.progress.set(this.progress());
					})
					.eventCallback('onComplete', () => {
						this.constructor.progress.complete();
					});
			}
		}
		
		this.elements.viewport.style.aspectRatio = `${ratio}`;
		
		this.updateViewportDimensions();
	}
	
	doTween(position, ...targets) {
		this.tween?.kill();
		
		this.tween = gsap.timeline({paused: true});
		const values = {};
		
		let weight = WEIGHTS.POSITION;
		
		for (const [type, value, {delay = 0, ...ease}] of targets) {
			values[type] = this[type];
			
			this.tween.to(values, {[type]: value, ...ease}, delay);
			
			weight = Math.min(weight, WEIGHTS[type.toUpperCase()]);
		}
		
		const actions = [];
		
		if ('ratio' in values) {
			actions.push(() => {
				this.setWidth(values.ratio);
			});
		}
		
		if ('rotation' in values) {
			actions.push(() => {
				this.rotation = values.rotation;
				
				this.constrainRotation();
				this.applyRotation();
			});
		}
		
		if ('zoom' in values) {
			actions.push(() => {
				this.zoom = values.zoom;
				
				this.applyZoom();
			});
		}
		
		if (position) {
			if (typeof position === 'object') {
				actions.push(() => {
					this.position.x = position.x;
					this.position.y = position.y;
				});
			}
			
			const targetX = this.position.x < 0 ? -0.5 : 0.5;
			const targetY = this.position.y < 0 ? -0.5 : 0.5;
			
			actions.push(() => {
				this.position.x = targetX;
				this.position.y = targetY;
			});
		}
		
		this.constructor.progress.reset();
		
		return this.tween
			.eventCallback('onUpdate', () => {
				for (const action of actions) {
					action();
				}
				
				this.constrainPosition(weight);
				this.applyPosition();
				
				this.constructor.progress.set(this.tween.progress());
			})
			.eventCallback('onComplete', () => {
				this.constructor.progress.complete();
			})
			.play();
	}
}
