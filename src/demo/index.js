import {gsap} from 'gsap';

import './css';

import {getTheta, DEGREES, ERROR_ALLOWANCE} from '@/shared';

import Readout from './readout';
import Target from './target';
import Progress from './progress';

import getElements from './elements';

import {ALLOWANCE_CLICK, MULTIPLIERS_SCROLL, TWEEN_DEFAULT} from './consts';

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

let position = {x: 0, y: 0};
let rotation = DEGREES[90];
let zoom = 1;
let _ratioImage = 1;
let _ratioViewport = 1;

export default class {
	static readout = new Readout();
	static progress = new Progress();
	
	target = new Target(this);
	
	elements = getElements();
	element = this.elements.wrapper;
	
	sizesImage = {};
	sizesViewport = {};
	
	position = position;
	rotation = rotation;
	zoom = zoom;
	
	_ratioImage = _ratioImage;
	ratioImageInverse = 1;
	
	_ratioViewport = _ratioViewport;
	ratioViewportInverse = 1;
	
	ratio = 1;
	ratioInverse = 1;
	
	#init = dock(this.element)
		.then(() => new Promise((resolve) => {
			const observer = new ResizeObserver(() => {
				if (!this.element.isConnected) {
					observer.disconnect();
					
					return;
				}
				
				this.ratioViewport = _ratioViewport;
				this.ratioImage = _ratioImage;
				this.position = position;
				this.applyPosition();
				this.applyRotation();
				this.applyZoom();
				
				resolve();
			});
			
			observer.observe(this.element.parentElement);
		}));
	
	constructor() {
		const {viewport, image, resizer, imageWrapper} = this.elements;
		
		this.constructor.readout.setPosition(this);
		this.constructor.readout.setZoom(this);
		this.constructor.readout.setRotation(this);
		this.constructor.readout.setRatio(this);
		
		viewport.appendChild(this.constructor.progress.element);
		resizer.parentElement.insertBefore(this.constructor.readout.element, resizer);
		imageWrapper.append(this.target.element);
		
		resizer.addEventListener('pointerdown', (event) => {
			const {buttons, offsetX} = event;
			
			if (buttons !== 1 && buttons !== 2) {
				return;
			}
			
			event.stopPropagation();
			event.preventDefault();
			
			const moveCallback = (event) => {
				this.ratioViewport = (event.clientX - offsetX) / this.sizesViewport.height;
			};
			
			resizer.setPointerCapture(event.pointerId);
			
			resizer.addEventListener('pointermove', moveCallback);
			resizer.addEventListener('pointerup', () => {
				if (buttons === 2) {
					cancelRightClick();
					
					this.ratioViewport = 1;
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
			
			if (event.ctrlKey) {
				const increment = event.deltaY * MULTIPLIERS_SCROLL[event.deltaMode] / -1000;
				
				if (increment > 0) {
					this.ratioImage *= 1 + increment;
				} else {
					this.ratioImage /= 1 - increment;
				}
				
				return;
			}
			
			const increment = event.deltaY * MULTIPLIERS_SCROLL[event.deltaMode] / -1000;
			
			if (increment > 0) {
				this.zoom *= 1 + increment;
			} else {
				this.zoom /= 1 - increment;
			}
			
			this.constrainPosition({zoom: true});
			
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
				
				this.target.hide();
				
				if (!isClick) {
					return;
				}
				
				if (buttons === 1) {
					this.position.x = (offsetX / this.sizesImage.width) - 0.5;
					this.position.y = (-offsetY / this.sizesImage.height) + 0.5;
					
					this.constrainZoom();
					
					this.applyZoom();
					this.applyPosition();
				} else {
					this.reset();
				}
			}, {once: true});
		});
	}
	
	set ratioImage(ratio) {
		this._ratioImage = ratio;
		this.ratioImageInverse = 1 / this.ratioImage;
		
		this.elements.imageWrapper.style.aspectRatio = `${this.ratioImage}`;
		
		this.updateSizesImage();
	}
	
	get ratioImage() {
		return this._ratioImage;
	}
	
	set ratioViewport(ratio) {
		this._ratioViewport = ratio;
		this.ratioViewportInverse = 1 / ratio;
		
		this.elements.viewport.style.aspectRatio = `${ratio}`;
		
		this.updateSizesViewport();
	}
	
	get ratioViewport() {
		return this._ratioViewport;
	}
	
	init() {
		return this.#init;
	}
	
	setDimensions(data, {offsetWidth, offsetHeight}) {
		data.width = offsetWidth;
		data.height = offsetHeight;
		
		data.halfWidth = data.width / 2;
		data.halfHeight = data.height / 2;
	}
	
	updateSizesImage(doApply = true) {
		this.ratio = this.ratioViewport / this.ratioImage;
		this.ratioInverse = 1 / this.ratio;
		
		this.elements.imageWrapper.style.height = `${Math.min(1, this.ratio) * 100}%`;
		
		this.setDimensions(this.sizesImage, this.elements.imageWrapper);
		
		this.constructor.readout.setRatio(this);
		
		if (doApply) {
			this.constrainPosition({ratio: true});
			this.applyPosition();
		}
	}
	
	updateSizesViewport() {
		this.updateSizesImage(false);
		
		this.setDimensions(this.sizesViewport, this.elements.viewport);
		
		this.constrainPosition({ratio: true});
		this.applyPosition();
	}
	
	reset() {
		this.zoom = 1;
		this.rotation = DEGREES[90];
		
		this.applyZoom();
		this.applyRotation();
		
		this.position.x = 0;
		this.position.y = 0;
		this.ratioImage = 1;
	}
	
	getPanListener() {
		let priorEvent;
		
		const change = {x: 0, y: 0};
		
		return ({offsetX, offsetY, ctrlKey}) => {
			if (priorEvent) {
				change.x = priorEvent.offsetX + change.x - offsetX;
				change.y = change.y + offsetY - priorEvent.offsetY;
				
				this.position.x += change.x / this.sizesImage.width;
				this.position.y += change.y / this.sizesImage.height;
				
				const target = {...this.position};
				
				if (!ctrlKey) {
					this.constrainPosition({position: true});
				}
				
				this.target.set(target);
				
				this.applyPosition();
			}
			
			// events in firefox seem to lose their data after finishing propagation
			// so assigning the whole event doesn't work
			priorEvent = {offsetX, offsetY};
		};
	}
	
	getRotateListener() {
		const {left, top} = this.elements.viewport.getBoundingClientRect();
		const middleX = left + this.sizesViewport.halfWidth;
		const middleY = top + this.sizesViewport.halfHeight;
		
		let priorMouseTheta;
		let startRotation = this.rotation;
		
		return (event) => {
			const mouseTheta = getTheta(event.clientX, event.clientY, middleX, middleY);
			
			if (priorMouseTheta === undefined) {
				priorMouseTheta = mouseTheta;
				
				return;
			}
			
			this.rotation = startRotation + (priorMouseTheta - mouseTheta);
			
			const target = {...this.position};
			
			this.constrainRotation();
			this.constrainPosition({rotation: true});
			
			this.target.set(target);
			
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
		
		this.constructor.readout.setPosition(this);
	}
	
	applyZoom() {
		this.elements.imageWrapper.style.scale = `${this.zoom}`;
		
		this.constructor.readout.setZoom(this);
	}
	
	applyRotation() {
		this.elements.imageWrapper.style.rotate = `${DEGREES[90] - this.rotation}rad`;
		
		this.constructor.readout.setRotation(this);
	}
	
	getNearestCorner() {
		return {
			x: this.position.x < 0 ? -0.5 : 0.5,
			y: this.position.y < 0 ? -0.5 : 0.5,
		};
	}
	
	remove() {
		position = this.position;
		rotation = this.rotation;
		zoom = this.zoom;
		_ratioViewport = this._ratioViewport;
		_ratioImage = this._ratioImage;
		
		this.tween?.progress(0).kill();
	}
	
	deleteTween() {
		this.target.hide();
		
		this.tween.kill();
		
		delete this.tween;
	}
	
	getTweenFrom() {
		const from = {};
		
		let effects = {};
		
		const doUpdate = (() => {
			let willUpdate = false;
			
			const update = () => {
				if (this.position.x !== from.x || this.position.y !== from.y) {
					this.position.x = from.x;
					this.position.y = from.y;
					
					effects.position = true;
				}
				
				this.constrainPosition(effects);
				this.applyPosition();
				
				this.target.set(from);
				
				effects = {};
				willUpdate = false;
			};
			
			return (label) => {
				effects[label] = true;
				
				if (willUpdate) {
					return;
				}
				
				willUpdate = true;
				
				window.setTimeout(update, 0);
			};
		})();
		
		const getDefinition = (initial, act) => (() => {
			let value = initial;
			
			return {
				set: (newValue) => {
					value = act(newValue);
				},
				get: () => value,
			};
		})();
		
		Object.defineProperty(from, 'x', getDefinition(this.position.x, (x) => {
			doUpdate('position');
			
			return this.position.x = x;
		}));
		Object.defineProperty(from, 'y', getDefinition(this.position.y, (y) => {
			doUpdate('position');
			
			return this.position.y = y;
		}));
		
		Object.defineProperty(from, 'ratio', getDefinition(this.ratio, (ratio) => {
			doUpdate('ratio');
			
			this.ratioImage = this.ratioViewport / ratio;
			
			return ratio;
		}));
		
		Object.defineProperty(from, 'ratioImage', getDefinition(this.ratio, (ratio) => {
			doUpdate('ratio');
			
			this.ratioImage = ratio;
			
			return ratio;
		}));
		
		Object.defineProperty(from, 'rotation', getDefinition(this.rotation, (rotation) => {
			doUpdate('rotation');
			
			this.rotation = rotation;
			
			this.constrainRotation();
			this.applyRotation();
			
			return rotation;
		}));
		
		Object.defineProperty(from, 'zoom', getDefinition(this.zoom, (zoom) => {
			doUpdate('zoom');
			
			this.zoom = zoom;
			
			this.applyZoom();
			
			return zoom;
		}));
		
		return from;
	}
	
	setTween(...targets) {
		this.tween?.progress(0).kill();
		
		this.tween = gsap.timeline({paused: true, data: {}});
		
		const from = this.getTweenFrom();
		
		const allEffects = {};
		
		for (const [target, {position, ...vars} = {}] of targets) {
			const to = {};
			const effects = {};
			
			let hasTween = false;
			
			const record = (type, value, label = type) => {
				if (!allEffects[label] && Math.abs(from[type] - value) < ERROR_ALLOWANCE) {
					return;
				}
				
				to[type] = value;
				allEffects[label] = effects[label] = true;
				
				hasTween = true;
			};
			
			for (const [type, value] of Object.entries(target)) {
				if (type === 'position') {
					if (typeof value === 'object') {
						record('x', value.x, 'position');
						record('y', value.y, 'position');
					} else {
						record('x', value, 'position');
						record('y', value, 'position');
					}
				} else if (type === 'x' || type === 'y') {
					record(type, value, 'position');
				} else if (type === 'rotation') {
					if (value > this.rotation) {
						record(type, value - this.rotation <= DEGREES[180] ? value : value - DEGREES[360]);
					} else {
						record(type, this.rotation - value <= DEGREES[180] ? value : value + DEGREES[360]);
					}
				} else {
					record(type, value);
				}
			}
			
			if (!hasTween) {
				continue;
			}
			
			this.tween.add(gsap.to(from, {...TWEEN_DEFAULT, ...to, ...vars}), position);
		}
		
		this.constructor.progress.reset();
		
		return this.tween
			.eventCallback('onUpdate', () => {
				this.constructor.progress.set(this.tween.totalProgress());
			})
			.eventCallback('onReverseComplete', () => this.deleteTween())
			.play();
	}
}
