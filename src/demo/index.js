import {gsap} from 'gsap';

import './css';

import {getTheta, DEGREES, ERROR_ALLOWANCE} from '@/shared';

import Readout from './readout';
import Target from './target';
import Progress from './progress';

import getElements from './elements';

import {ALLOWANCE_CLICK, MULTIPLIERS_SCROLL, TWEEN_DEFAULT} from './consts';
import {isVertical, list as orientation} from '@/shared/orientation';

const getAngleDiff = (a, b) => {
	let diff = a - b;
	
	if (diff > DEGREES[180]) {
		diff = DEGREES[360] - diff;
	} else if (diff < -DEGREES[180]) {
		diff = -DEGREES[360] - diff;
	}
	
	return [Math.abs(diff), Math.abs(a - diff / 2)];
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

const getInitialRatio = () => isVertical() ?
		Math.max(1, window.innerWidth / (window.innerHeight / 2)) :
		Math.min(1, (window.innerWidth / 2) / window.innerHeight);

let position = {x: 0, y: 0};
let rotation = DEGREES[90];
let zoom = 1;
let _ratioImage = 1;
let _ratioViewport = getInitialRatio();

export default class {
	static elements = getElements();
	static element = this.elements.wrapper;
	
	static readout = new Readout(this);
	static progress = new Progress();
	
	static target = new Target(this);
	
	static listeners = {
		zoom(increment) {
			if (increment > 0) {
				this.zoom *= 1 + increment;
			} else {
				this.zoom /= 1 - increment;
			}
			
			this.constrainPosition({zoom: true});
			
			this.applyPosition();
			this.applyZoom();
		},
		resizeViewport(isHorizontal, offset, event) {
			let ratio;
			
			if (isHorizontal) {
				const position = event.clientX - offset;
				
				if (window.innerWidth > position + event.target.clientWidth) {
					this.ratioViewport = (event.clientX - offset) / this.sizesViewport.height;
					
					return;
				}
				
				ratio = (window.innerWidth - event.target.clientWidth) / this.sizesViewport.height;
			} else {
				const position = event.clientY - offset;
				
				if (window.innerHeight > position + event.target.clientHeight) {
					this.ratioViewport = this.sizesViewport.width / (event.clientY - offset);
					
					return;
				}
				
				ratio = this.sizesViewport.width / (window.innerHeight - event.target.clientHeight);
			}
			
			if (this.ratioViewport !== ratio) {
				this.ratioViewport = ratio;
			}
		},
		resizeImage(increment) {
			if (increment > 0) {
				this.ratioImage *= 1 + increment;
			} else {
				this.ratioImage /= 1 - increment;
			}
		},
		resetViewport() {
			this.ratioViewport = 1;
		},
		pan() {
			const change = {x: 0, y: 0};
			
			return (x, y) => {
				change.x += x;
				change.y += y;
				
				this.position.x += change.x / this.sizesImage.width;
				this.position.y += change.y / this.sizesImage.height;
				
				const target = {...this.position};
				
				this.constrainPosition({position: true});
				
				this.constructor.target.set(target);
				
				this.applyPosition();
			};
		},
		rotate() {
			const target = {...this.position};
			
			this.constrainRotation();
			this.constrainPosition({rotation: true});
			
			this.constructor.target.set(target);
			
			this.applyRotation();
			this.applyPosition();
		},
		snap(offsetX, offsetY) {
			this.position.x = offsetX / this.sizesImage.width - 0.5;
			this.position.y = 0.5 - offsetY / this.sizesImage.height;
			
			this.constrainZoom();
			
			this.applyZoom();
			this.applyPosition();
		},
		resetImage() {
			this.zoom = 1;
			this.rotation = DEGREES[90];
			
			this.applyZoom();
			this.applyRotation();
			
			this.position.x = this.position.y = 0;
			this.ratioImage = 1;
		},
		
	};
	
	listeners = Object.fromEntries(Object.entries(this.constructor.listeners).map(([key, listener]) => [key, listener.bind(this)]));
	
	sizesImage = {};
	sizesViewport = {};
	
	position = position;
	rotation = rotation;
	zoom = zoom;
	
	_ratioImage = _ratioImage;
	ratioImageInverse = 1 / _ratioImage;
	
	_ratioViewport = _ratioViewport;
	ratioViewportInverse = 1 / _ratioViewport;
	
	#listeners = [];
	#resizeObserver;
	#removeResolver;
	#tweenUpdateId;
	tweenUpdate = Promise.resolve();
	isRemoved = false;
	removed = new Promise((resolve) => {
		this.#removeResolver = resolve;
	})
		.then(() => this.isRemoved = true);
	
	#init = Promise.race([
		this.removed,
		dock(this.constructor.element)
			.then(() => new Promise((resolve) => {
				this.#resizeObserver = new ResizeObserver(() => {
					if (!this.isRemoved) {
						this.constructor.elements.imageWrapper.style.aspectRatio = `${this.ratioImage}`;
						this.constructor.elements.viewport.style.aspectRatio = `${this.ratioViewport}`;
						
						this.updateSizesViewport();
						
						this.applyPosition();
						this.applyRotation();
						this.applyZoom();
					}
					
					this.#resizeObserver.disconnect();
					
					resolve();
				});
				
				this.#resizeObserver.observe(this.constructor.element.parentElement);
			})),
	]);
	
	constructor() {
		this.constructor.target.setDemo(this);
		
		const {viewport, image, resizerHorizontal, resizerVertical} = this.constructor.elements;
		
		this.constructor.readout.setPosition(this);
		this.constructor.readout.setZoom(this);
		this.constructor.readout.setRotation(this);
		this.constructor.readout.setRatio(this);
		
		viewport.appendChild(this.constructor.progress.element);
		
		this.init().then(() => {
			if (this.isRemoved) {
				return;
			}
			
			this.addEventListener(orientation, 'change', () => {
				this.ratioViewport = getInitialRatio();
			});
			
			this.addEventListener(window, 'resize', () => {
				const ratio = viewport.offsetWidth / viewport.offsetHeight;
				
				if (ratio !== this.ratioViewport) {
					this.ratioViewport = ratio;
				}
			});
			
			for (const [resizer, isHorizontal] of [[resizerHorizontal, true], [resizerVertical, false]]) {
				this.addPointerDownListener(resizer, resizer, {
					get: (event) => [
						() => this.listeners.resetViewport(),
						(() => {
							const offset = event[`offset${isHorizontal ? 'X' : 'Y'}`];
							
							return (event) => this.listeners.resizeViewport(isHorizontal, offset, event);
						})(),
					],
				});
			}
			
			this.addEventListener(viewport, 'wheel', (event) => {
				event.stopPropagation();
				event.preventDefault();
				
				if (event.deltaY === 0) {
					return;
				}
				
				if (event.ctrlKey) {
					this.listeners.resizeImage(event.deltaY * MULTIPLIERS_SCROLL[event.deltaMode] / -1000);
					
					return;
				}
				
				this.listeners.zoom(event.deltaY * MULTIPLIERS_SCROLL[event.deltaMode] / -1000);
			});
			
			this.addPointerDownListener(
				viewport, image,
				{
					isClick: ({buttons, target}) => buttons !== 1 || image.isSameNode(target),
					onStart: () => {
						image.style.cursor = 'grabbing';
					},
					onFinish: () => {
						this.constructor.target.hide();
						
						image.style.removeProperty('cursor');
					},
					get: ({pointerType, offsetX, offsetY, buttons}) => pointerType === 'mouse' ?
							[
								() => {
									if (buttons === 1) {
										this.listeners.snap(offsetX, offsetY);
									} else {
										this.listeners.resetImage();
									}
								},
								buttons === 1 ?
										(() => {
											const pan = this.listeners.pan();
											
											let priorEvent;
											
											return ({offsetX, offsetY}) => {
												if (priorEvent) {
													pan(priorEvent.offsetX - offsetX, offsetY - priorEvent.offsetY);
												}
												
												// events in firefox seem to lose their data after finishing propagation
												// so assigning the whole event doesn't work
												priorEvent = {offsetX, offsetY};
											};
										})() :
										(() => {
											const {left, top} = this.constructor.elements.viewport.getBoundingClientRect();
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
												
												this.listeners.rotate();
											};
										})(),
							] :
							[
								(clickCount) => {
									if (clickCount > 1) {
										this.listeners.resetImage();
									} else {
										this.listeners.snap(offsetX, offsetY);
									}
								},
								(() => {
									const pan = this.listeners.pan();
									
									return (event, touches, pointerCount) => {
										const touch = touches[event.pointerId];
										let isFirst = !touch.client;
										
										if (isFirst) {
											touch.client = {};
											touch.offset = {};
										} else {
											touch.client.from = touch.client.to;
											touch.offset.from = touch.offset.to;
										}
										
										touch.client.to = {x: event.clientX, y: event.clientY};
										touch.offset.to = {x: event.offsetX, y: event.offsetY};
										
										if (isFirst) {
											return;
										}
										
										touch.angle = getTheta(touch.client.to.x, touch.client.to.y, touch.client.from.x, touch.client.from.y);
										
										if (pointerCount > 2) {
											return;
										}
										
										if (pointerCount === 1) {
											pan(touch.offset.from.x - touch.offset.to.x, touch.offset.to.y - touch.offset.from.y);
											
											return;
										}
										
										const other = touches[Object.keys(touches).find((key) => key !== `${event.pointerId}`)];
										
										if (!('angle' in other)) {
											return;
										}
										
										const [angleDiff, angleMean] = getAngleDiff(touch.angle, other.angle);
										
										if (angleDiff > DEGREES[90]) {
											if (angleDiff > DEGREES[270]) {
												return;
											}
											
											const center = {
												x: (touch.client.from.x + other.client.to.x) / 2,
												y: (touch.client.from.y + other.client.to.y) / 2,
											};
											
											const dFrom = Math.sqrt(Math.pow(touch.client.from.x - center.x, 2) + Math.pow(touch.client.from.y - center.y, 2));
											const dTo = Math.sqrt(Math.pow(touch.client.to.x - center.x, 2) + Math.pow(touch.client.to.y - center.y, 2));
											
											this.listeners.zoom((dTo - dFrom) / Math.max(this.sizesViewport.halfWidth, this.sizesViewport.halfHeight));
											
											return;
										}
										
										// ignore diagonal swipes
										if (Math.abs((angleMean % DEGREES[90]) - DEGREES[45]) < DEGREES['45_2']) {
											return;
										}
										
										if (Math.abs((angleMean % DEGREES[180]) - DEGREES[90]) < DEGREES['45']) {
											const from = (touch.client.from.y + other.client.to.y) / 2;
											const to = (touch.client.to.y + other.client.to.y) / 2;
											
											this.listeners.resizeImage((to - from) / this.sizesViewport.halfHeight);
											
											return;
										}
										
										const from = (touch.client.from.x + other.client.to.x) / 2;
										const to = (touch.client.to.x + other.client.to.x) / 2;
										
										this.rotation += (from - to) / this.sizesViewport.width * DEGREES[360];
										
										this.listeners.rotate();
									};
								})(),
							],
				},
			);
		});
	}
	
	addEventListener(element, type, listener) {
		element.addEventListener(type, listener);
		
		const entry = [element, type, listener];
		
		this.#listeners.push(entry);
		
		return entry;
	}
	
	removeEventListener(target) {
		for (const [i, entry] of this.#listeners.entries()) {
			if (entry === target) {
				this.#listeners.splice(i, 1);
				
				const [element, type, listener] = entry;
				
				element.removeEventListener(type, listener);
				
				return;
			}
		}
	}
	
	addPointerDownListener(element, target, {isClick: getIsClick, onStart, onFinish, get}) {
		const events = {};
		let pointerCount = 0;
		let clickCount = 0;
		let failedClick = false;
		
		this.addEventListener(element, 'pointerdown', (event) => {
			const {buttons, clientX, clientY, pointerId} = event;
			
			if (buttons !== 1 && buttons !== 2) {
				return;
			}
			
			event.stopPropagation();
			event.preventDefault();
			
			const addPointerListener = (type, listener) => this.addEventListener(target, type, (event) => {
				if (event.pointerId === pointerId) {
					listener(event);
				}
			});
			
			const [clickListener, moveListener] = get(event);
			
			if (pointerCount === 0) {
				onStart?.();
				
				failedClick = false;
				clickCount = 0;
			}
			
			pointerCount++;
			
			let isClick = getIsClick?.(event) ?? true;
			
			target.setPointerCapture(event.pointerId);
			
			let entryClickNegater;
			
			if (isClick) {
				entryClickNegater = addPointerListener('pointermove', (event) => {
					if (Math.abs(event.clientX - clientX) > ALLOWANCE_CLICK || Math.abs(event.clientY - clientY) > ALLOWANCE_CLICK) {
						isClick = false;
						
						this.removeEventListener(entryClickNegater);
					}
				});
			}
			
			events[pointerId] = {};
			
			const entryMove = addPointerListener('pointermove', (event) => {
				moveListener(event, events, pointerCount);
			});
			
			const entryStop = addPointerListener('pointerup', () => {
				this.removeEventListener(entryStop);
				
				if (entryClickNegater) {
					this.removeEventListener(entryClickNegater);
				}
				
				this.removeEventListener(entryMove);
				
				if (buttons === 2) {
					cancelRightClick();
				}
				
				delete events[pointerId];
				pointerCount--;
				
				if (pointerCount === 0) {
					onFinish?.();
				}
				
				if (!isClick) {
					failedClick = true;
					
					return;
				}
				
				if (failedClick) {
					return;
				}
				
				clickCount++;
				
				if (pointerCount === 0) {
					clickListener(clickCount);
				}
			});
		});
	}
	
	set ratioImage(ratio) {
		this._ratioImage = ratio;
		this.ratioImageInverse = 1 / this.ratioImage;
		
		this.constructor.elements.imageWrapper.style.aspectRatio = `${this.ratioImage}`;
		
		this.updateSizesImage();
	}
	
	get ratioImage() {
		return this._ratioImage;
	}
	
	set ratioViewport(ratio) {
		this._ratioViewport = ratio;
		this.ratioViewportInverse = 1 / ratio;
		
		this.constructor.elements.viewport.style.aspectRatio = `${ratio}`;
		
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
		
		this.constructor.elements.imageWrapper.style.height = `${Math.min(1, this.ratio) * 100}%`;
		this.constructor.elements.imageWrapper.style.width = `${Math.min(1, this.ratioInverse) * 100}%`;
		
		this.setDimensions(this.sizesImage, this.constructor.elements.imageWrapper);
		
		this.constructor.readout.setRatio(this);
		
		if (doApply) {
			this.constrainPosition({ratio: true, ratioImage: true});
			this.applyPosition();
		}
	}
	
	updateSizesViewport() {
		this.updateSizesImage(false);
		
		this.setDimensions(this.sizesViewport, this.constructor.elements.viewport);
		
		this.constrainPosition({ratio: true});
		this.applyPosition();
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
		this.constructor.elements.imageWrapper.style.translate = `${-this.position.x * 100}% ${this.position.y * 100}%`;
		this.constructor.elements.imageWrapper.style.transformOrigin = `${(0.5 + this.position.x) * 100}% ${(0.5 - this.position.y) * 100}%`;
		
		this.constructor.readout.setPosition(this);
	}
	
	applyZoom() {
		this.constructor.elements.imageWrapper.style.scale = `${this.zoom}`;
		
		this.constructor.readout.setZoom(this);
	}
	
	applyRotation() {
		this.constructor.elements.imageWrapper.style.rotate = `${DEGREES[90] - this.rotation}rad`;
		
		this.constructor.readout.setRotation(this);
	}
	
	getNearestCorner() {
		return {
			x: this.position.x < 0 ? -0.5 : 0.5,
			y: this.position.y < 0 ? -0.5 : 0.5,
		};
	}
	
	remove() {
		for (const [element, type, listener] of this.#listeners) {
			element.removeEventListener(type, listener);
		}
		
		this.#listeners.length = 0;
		
		this.#resizeObserver?.disconnect();
		
		// triggers onReverseComplete which calls deleteTween
		this.tween?.progress(0);
		
		this.#removeResolver();
		
		window.clearTimeout(this.#tweenUpdateId);
		
		this.tweenUpdate = Promise.resolve();
		
		this.constructor.target.hide();
		
		position = this.position;
		rotation = this.rotation;
		zoom = this.zoom;
		_ratioViewport = this._ratioViewport;
		_ratioImage = this._ratioImage;
	}
	
	deleteTween() {
		this.constructor.target.hide();
		
		this.tween.kill();
		
		delete this.tween;
	}
	
	getTweenTarget(tween) {
		const target = {};
		
		let effects = {};
		
		const doUpdate = (() => {
			let willUpdate = false;
			
			const update = () => {
				const {ignorePosition} = tween.data;
				
				if (!ignorePosition && (this.position.x !== target.x || this.position.y !== target.y)) {
					this.position.x = target.x;
					this.position.y = target.y;
					
					effects.position = true;
				}
				
				this.constrainPosition(effects);
				this.applyPosition();
				
				if (!ignorePosition) {
					this.constructor.target.set(target);
				}
				
				effects = {};
				willUpdate = false;
			};
			
			return (label) => {
				effects[label] = true;
				
				if (willUpdate) {
					return;
				}
				
				willUpdate = true;
				
				this.tweenUpdate = new Promise((resolve) => {
					this.#tweenUpdateId = window.setTimeout(() => {
						update();
						
						resolve();
					});
				}, 0);
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
		
		Object.defineProperty(target, 'x', getDefinition(this.position.x, (x) => {
			doUpdate('position');
			
			return this.position.x = x;
		}));
		Object.defineProperty(target, 'y', getDefinition(this.position.y, (y) => {
			doUpdate('position');
			
			return this.position.y = y;
		}));
		
		Object.defineProperty(target, 'ratio', getDefinition(this.ratio, (ratio) => {
			doUpdate('ratio');
			
			this.ratioImage = this.ratioViewport / ratio;
			
			return ratio;
		}));
		
		Object.defineProperty(target, 'ratioImage', getDefinition(this.ratioImage, (ratio) => {
			doUpdate('ratio');
			
			this.ratioImage = ratio;
			
			return ratio;
		}));
		
		Object.defineProperty(target, 'rotation', getDefinition(this.rotation, (rotation) => {
			doUpdate('rotation');
			
			this.rotation = rotation;
			
			this.constrainRotation();
			this.applyRotation();
			
			return rotation;
		}));
		
		Object.defineProperty(target, 'zoom', getDefinition(this.zoom, (zoom) => {
			doUpdate('zoom');
			
			this.zoom = zoom;
			
			this.applyZoom();
			
			return zoom;
		}));
		
		return target;
	}
	
	setTween(...targets) {
		this.tween?.progress(0).kill();
		
		this.tween = gsap.timeline({paused: true, data: {}});
		
		this.tween.data.target = this.getTweenTarget(this.tween);
		
		const effects = {};
		
		for (const [target, {position, ...vars} = {}] of targets) {
			const to = {};
			
			let hasTween = false;
			
			const record = (type, value, label = type) => {
				if (!effects[label] && Math.abs(this.tween.data.target[type] - value) < ERROR_ALLOWANCE) {
					return;
				}
				
				to[type] = value;
				effects[label] = true;
				
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
			
			this.tween.add(gsap.to(this.tween.data.target, {...TWEEN_DEFAULT, ...to, ...vars}), position);
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
