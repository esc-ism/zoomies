import {gsap} from 'gsap';

import './css';

import {getTheta, DEGREES} from '@/shared';

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

export default class {
	static readout = new Readout();
	static progress = new Progress();
	
	target = new Target(this);
	
	elements = getElements();
	element = this.elements.wrapper;
	
	imageDimensions = {};
	viewportDimensions = {};
	
	position = {x: 0, y: 0};
	rotation = DEGREES[90];
	zoom = 1;
	
	_ratioImage = 1;
	ratioImageInverse = 1;
	
	_ratioViewport = 1;
	ratioViewportInverse = 1;
	
	constructor() {
		const {wrapper, viewport, image, resizer, imageWrapper} = this.elements;
		
		this.constructor.readout.setPosition(this);
		this.constructor.readout.setZoom(this);
		this.constructor.readout.setRotation(this);
		this.constructor.readout.setRatio(this);
		
		viewport.appendChild(this.constructor.progress.element);
		resizer.parentElement.insertBefore(this.constructor.readout.element, resizer);
		imageWrapper.append(this.target.element);
		
		dock(wrapper).then(() => {
			const observer = new ResizeObserver(() => {
				if (!this.element.isConnected) {
					observer.disconnect();
					
					return;
				}
				
				this.updateViewportDimensions();
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
				this.ratioViewport = (event.clientX - offsetX) / this.viewportDimensions.height;
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
	
	set ratioImage(ratio) {
		this._ratioImage = ratio;
		this.ratioImageInverse = 1 / this.ratioImage;
		
		this.elements.imageWrapper.style.aspectRatio = `${this.ratioImage}`;
		
		this.constructor.readout.setRatio(this);
		
		this.updateImageDimensions();
	}
	
	get ratioImage() {
		return this._ratioImage;
	}
	
	set ratioViewport(ratio) {
		this._ratioViewport = ratio;
		this.ratioViewportInverse = 1 / ratio;
		
		this.elements.viewport.style.aspectRatio = `${ratio}`;
		
		this.constructor.readout.setRatio(this);
		
		this.updateViewportDimensions();
	}
	
	get ratioViewport() {
		return this._ratioViewport;
	}
	
	setDimensions(data, {offsetWidth, offsetHeight}) {
		data.width = offsetWidth;
		data.height = offsetHeight;
		
		data.halfWidth = data.width / 2;
		data.halfHeight = data.height / 2;
	}
	
	updateImageDimensions(doApply = true) {
		this.elements.imageWrapper.style.height = `${Math.min(1, this.ratioViewport / this.ratioImage) * 100}%`;
		
		this.setDimensions(this.imageDimensions, this.elements.imageWrapper);
		
		if (doApply) {
			this.constrainPosition({ratio: true});
			this.applyPosition();
		}
	}
	
	updateViewportDimensions() {
		this.updateImageDimensions(false);
		
		this.setDimensions(this.viewportDimensions, this.elements.viewport);
		
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
		
		return ({offsetX, offsetY}) => {
			if (priorEvent) {
				change.x = priorEvent.offsetX + change.x - offsetX;
				change.y = change.y + offsetY - priorEvent.offsetY;
				
				this.position.x += change.x / this.imageDimensions.width;
				this.position.y += change.y / this.imageDimensions.height;
				
				const target = {...this.position};
				
				this.constrainPosition({position: true});
				
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
		this.tween?.progress(0).kill();
	}
	
	deleteTween() {
		this.target.hide();
		
		this.tween.kill();
		
		delete this.tween;
	}
	
	setTween(...targets) {
		this.tween?.progress(0).kill();
		
		this.tween = gsap.timeline({paused: true, data: {}});
		const values = {};
		
		const actions = [];
		
		let hasTween = false;
		
		const setTween = (type, value, {delay = 0, ...vars} = {}, current = this[type]) => {
			if (!(type in values) && Math.abs(current - value) < 0.01) {
				return;
			}
			
			values[type] = current;
			
			this.tween.to(values, {...TWEEN_DEFAULT, [type]: value, ...vars}, delay);
			
			hasTween = true;
		};
		
		for (const [type, value, vars] of targets) {
			if (type === 'position') {
				if (typeof value === 'object') {
					setTween('x', value.x, vars, this.position.x);
					setTween('y', value.y, {...vars, delay: '<'}, this.position.y);
				} else {
					setTween('x', value, vars, this.position.x);
					setTween('y', value, {...vars, delay: '<'}, this.position.y);
				}
			} else if (type === 'x' || type === 'y') {
				setTween(type, value, vars, this.position[type]);
			} else if (type === 'ratio') {
				setTween(type, value, vars, this.ratioViewport / this.ratioImage);
			} else if (type === 'rotation') {
				if (value > this.rotation) {
					setTween(type, value - this.rotation <= DEGREES[180] ? value : value - DEGREES[360], vars);
				} else {
					setTween(type, this.rotation - value <= DEGREES[180] ? value : value + DEGREES[360], vars);
				}
			} else {
				setTween(type, value, vars);
			}
		}
		
		if (!hasTween) {
			this.deleteTween();
			
			return;
		}
		
		if ('ratio' in values) {
			actions.push((effects) => {
				effects.ratio = true;
				
				this.ratioImage = this.ratioViewport / values.ratio;
			});
		}
		
		if ('rotation' in values) {
			actions.push((effects) => {
				effects.rotation = true;
				
				this.rotation = values.rotation;
				
				this.constrainRotation();
				this.applyRotation();
			});
		}
		
		if ('zoom' in values) {
			actions.push((effects) => {
				effects.zoom = true;
				
				this.zoom = values.zoom;
				
				this.applyZoom();
			});
		}
		
		if ('x' in values) {
			actions.push((effects) => {
				effects.position = true;
				
				this.position.x = values.x;
			});
		}
		
		if ('y' in values) {
			actions.push((effects) => {
				effects.position = true;
				
				this.position.y = values.y;
			});
		}
		
		this.constructor.progress.reset();
		
		return this.tween
			.eventCallback('onUpdate', () => {
				const effects = {};
				
				for (const action of actions) {
					action(effects);
				}
				
				this.constrainPosition(effects);
				this.applyPosition();
				
				this.target.set({x: values.x ?? this.position.x, y: values.y ?? this.position.y});
				
				this.constructor.progress.set(this.tween.totalProgress());
			})
			.eventCallback('onReverseComplete', () => this.deleteTween())
			.play();
	}
}
