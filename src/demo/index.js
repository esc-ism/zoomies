import {gsap} from 'gsap';

import {isVertical, list as orientation} from '@/shared/orientation';
import {getTheta, DEGREES, ALLOWANCE_ERROR, getAngleDiff} from '@/shared';

import Readout from './readout';
import Target from './target';
import Progress from './progress';
import elements from './elements';
import {ALLOWANCE_CLICK, MULTIPLIERS_SCROLL, TWEEN_DEFAULT} from './consts';

import './css';

const getAngleData = (a, b) => {
	const diff = getAngleDiff(a, b);
	
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

class ActionHook {
	listeners = {
		local: [],
		global: [],
	};
	
	add(listener, isGlobal = false) {
		this.listeners[isGlobal ? 'global' : 'local'].push(listener);
	}
	
	emit() {
		for (const listeners of [this.listeners.global, this.listeners.local]) {
			for (let i = listeners.length - 1; i >= 0; --i) {
				if (listeners[i]()) {
					listeners.splice(i, 1);
				}
			}
		}
	}
	
	clear() {
		this.listeners.local.length = 0;
	}
}

let startPosition;

export default new class {
	// todo necessary?
	elements = elements;
	element = this.elements.wrapper;
	
	readout = new Readout();
	progress = new Progress();
	target = new Target();
	
	listeners = {
		zoom: (increment) => {
			if (increment > 0) {
				this.zoom *= 1 + increment;
			} else {
				this.zoom /= 1 - increment;
			}
			
			this.system.constrainPosition({zoom: true});
			
			this.applyPosition();
			this.applyZoom();
		},
		resizeViewport: (isHorizontal, offset, event) => {
			let ratio;
			
			if (isHorizontal) {
				const position = event.clientX - offset;
				const max = window.innerWidth - this.pageMinWidth - event.target.offsetWidth;
				
				if (position < max) {
					this.ratioViewport = position / this.sizesViewport.height;
					
					return;
				}
				
				ratio = max / this.sizesViewport.height;
			} else {
				const position = event.clientY - offset;
				const max = window.innerHeight - this.pageMinHeight - event.target.offsetHeight;
				
				if (position < max) {
					this.ratioViewport = this.sizesViewport.width / position;
					
					return;
				}
				
				ratio = this.sizesViewport.width / max;
			}
			
			if (this.ratioViewport !== ratio) {
				this.ratioViewport = ratio;
			}
		},
		resizeImage: (increment) => {
			if (increment > 0) {
				this.ratioImage *= 1 + increment;
			} else {
				this.ratioImage /= 1 - increment;
			}
		},
		resetViewport: () => {
			this.ratioViewport = getInitialRatio();
		},
		pan: () => {
			const change = {x: 0, y: 0};
			
			return (x, y) => {
				this.hooks.pan.emit();
				
				change.x += x;
				change.y += y;
				
				this.position.x += change.x / this.sizesImage.width;
				this.position.y += change.y / this.sizesImage.height;
				
				const target = {...this.position};
				
				this.system.constrainPosition({position: true});
				this.applyPosition();
				
				this.target.set(target);
			};
		},
		rotate: () => {
			const target = {...this.position};
			
			this.constrainRotation();
			this.system.constrainPosition({rotation: true});
			
			this.target.set(target);
			
			this.applyRotation();
			this.applyPosition();
		},
		snap: (offsetX, offsetY) => {
			this.position.x = offsetX / this.sizesImage.width - 0.5;
			this.position.y = 0.5 - offsetY / this.sizesImage.height;
			
			this.system.constrainZoom();
			
			this.applyZoom();
			this.applyPosition();
		},
		resetImage: () => {
			this.zoom = 1;
			this.rotation = DEGREES[90];
			
			this.applyZoom();
			this.applyRotation();
			
			this.position.x = this.position.y = 0;
			this.ratioImage = 1;
		},
	};
	
	hooks = {ratioChange: new ActionHook()};
	
	sizesImage = {};
	sizesViewport = {};
	
	position = {x: 0, y: 0};
	rotation = DEGREES[90];
	zoom = 1;
	
	_ratioImage = 1;
	ratioImageInverse = 1;
	
	_ratioViewport = getInitialRatio();
	ratioViewportInverse = 1 / this._ratioViewport;
	
	#tweenUpdateId;
	tweenUpdate = Promise.resolve();
	
	#init = dock(this.element)
		.then(() => new Promise((resolve) => {
			// todo can this be a 0 delay settimeout?
			const resizeObserver = new ResizeObserver(() => {
				if (!this.isRemoved) {
					this.elements.viewport.style.aspectRatio = `${this.ratioViewport}`;
					
					this.updateSizesViewport();
				}
				
				resizeObserver.disconnect();
				
				resolve();
			});
			
			resizeObserver.observe(this.element.parentElement);
		})).then(() => {
			const {viewport, image, resizerHorizontal, resizerVertical} = this.elements;
			
			orientation.addEventListener('change', () => {
				this.ratioViewport = getInitialRatio();
			});
			
			window.addEventListener('resize', () => {
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
			
			viewport.addEventListener('wheel', (event) => {
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
					onStart: () => {
						image.style.cursor = 'grabbing';
					},
					onFinish: () => {
						this.target.hide();
						
						image.style.removeProperty('cursor');
					},
					get: ({pointerType, offsetX, offsetY, buttons, target}) => pointerType === 'mouse' ?
							[
								() => {
									if (buttons !== 1) {
										this.listeners.resetImage();
									} else if (image.isSameNode(target)) {
										this.listeners.snap(offsetX, offsetY);
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
												
												this.listeners.rotate();
											};
										})(),
							] :
							[
								(clickCount) => {
									if (clickCount > 1) {
										this.listeners.resetImage();
									} else if (image.isSameNode(target)) {
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
										
										const [angleDiff, angleMean] = getAngleData(touch.angle, other.angle);
										
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
	
	constructor() {
		this.readout.setPosition(this);
		this.readout.setZoom(this);
		this.readout.setRotation(this);
		this.readout.setRatio(this);
		
		for (const [key, listener] of Object.entries(this.listeners)) {
			this.hooks[key] = new ActionHook();
			
			this.listeners[key] = (...args) => {
				window.setTimeout(() => {
					this.hooks[key].emit();
				}, 0);
				
				return listener(...args);
			};
		}
	}
	
	clearStartPosition() {
		if (startPosition) {
			startPosition = undefined;
			
			this.target.hide();
		}
	}
	
	setSystem({System, text}) {
		if (startPosition) {
			this.position.x = startPosition.x;
			this.position.y = startPosition.y;
		} else {
			startPosition = {...this.position};
		}
		
		this.system = new System();
		this.page = text;
		
		this.system.constrainPosition({position: true, ratio: true});
		this.applyPosition(true);
		
		this.target.set(startPosition);
	}
	
	addPointerDownListener(element, target, {onStart, onFinish, get}) {
		const events = {};
		let pointerCount = 0;
		let clickCount = 0;
		let failedClick = false;
		
		element.addEventListener('pointerdown', (event) => {
			const {buttons, clientX, clientY, pointerId} = event;
			
			if (buttons !== 1 && buttons !== 2) {
				return;
			}
			
			event.stopPropagation();
			event.preventDefault();
			
			const addPointerListener = (type, listener) => {
				const wrapped = (event) => {
					if (event.pointerId === pointerId) {
						listener(event);
					}
				};
				
				target.addEventListener(type, wrapped);
				
				return target.removeEventListener.bind(target, type, wrapped);
			};
			
			const [clickListener, moveListener] = get(event);
			
			if (pointerCount === 0) {
				onStart?.();
				
				failedClick = false;
				clickCount = 0;
			}
			
			pointerCount++;
			
			let isClick = true;
			
			target.setPointerCapture(event.pointerId);
			
			let removeClickNegater;
			
			if (isClick) {
				removeClickNegater = addPointerListener('pointermove', (event) => {
					if (Math.abs(event.clientX - clientX) > ALLOWANCE_CLICK || Math.abs(event.clientY - clientY) > ALLOWANCE_CLICK) {
						isClick = false;
						
						removeClickNegater();
						
						removeClickNegater = undefined;
					}
				});
			}
			
			events[pointerId] = {};
			
			const removeMoveListener = addPointerListener('pointermove', (event) => {
				moveListener(event, events, pointerCount);
			});
			
			const removeStopListener = addPointerListener('pointerup', () => {
				removeClickNegater?.();
				removeMoveListener();
				removeStopListener();
				
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
		
		this.elements.imageContainer.style.height = `${Math.min(1, this.ratio) * 100}%`;
		this.elements.imageContainer.style.width = `${Math.min(1, this.ratioInverse) * 100}%`;
		
		this.setDimensions(this.sizesImage, this.elements.imageContainer);
		
		this.readout.setRatio(this);
		
		this.hooks.ratioChange.emit();
		
		if (doApply) {
			this.system.constrainPosition({ratio: true, ratioImage: true});
			this.applyPosition();
		} else {
			this.clearStartPosition();
		}
	}
	
	updateSizesViewport() {
		this.updateSizesImage(false);
		
		this.setDimensions(this.sizesViewport, this.elements.viewport);
		
		this.system.constrainPosition({ratio: true});
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
	
	applyPosition(isStart = false) {
		if (!isStart) {
			this.clearStartPosition();
		}
		
		this.elements.imageContainer.style.translate = `${-this.position.x * 100}% ${this.position.y * 100}%`;
		this.elements.imageContainer.style.transformOrigin = `${(0.5 + this.position.x) * 100}% ${(0.5 - this.position.y) * 100}%`;
		
		this.readout.setPosition(this);
	}
	
	applyZoom() {
		this.clearStartPosition();
		
		this.elements.imageContainer.style.scale = `${this.zoom}`;
		
		this.readout.setZoom(this);
	}
	
	applyRotation() {
		this.clearStartPosition();
		
		this.elements.imageContainer.style.rotate = `${DEGREES[90] - this.rotation}rad`;
		
		this.readout.setRotation(this);
	}
	
	getNearestCorner() {
		return {
			x: this.position.x < 0 ? -0.5 : 0.5,
			y: this.position.y < 0 ? -0.5 : 0.5,
		};
	}
	
	remove() {
		// triggers onReverseComplete which calls deleteTween
		this.tween?.progress(0);
		
		window.clearTimeout(this.#tweenUpdateId);
		
		this.system.remove();
		
		this.target.hide();
		
		for (const hook of Object.values(this.hooks)) {
			hook.clear();
		}
	}
	
	deleteTween(isOngoing = true) {
		this.tween.kill();
		
		if (isOngoing) {
			window.clearTimeout(this.#tweenUpdateId);
		}
		
		delete this.tween;
		
		this.target.hide();
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
				
				this.system.constrainPosition(effects);
				this.applyPosition();
				
				if (!ignorePosition || !this.target.isHidden()) {
					this.target.set(target);
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
		if (this.tween) {
			this.deleteTween();
		}
		
		this.tween = gsap.timeline({paused: true, data: {}});
		
		this.tween.data.target = this.getTweenTarget(this.tween);
		
		const effects = {};
		
		for (const [target, {position, ...vars} = {}] of targets) {
			const to = {};
			
			let hasTween = false;
			
			const record = (type, value, label = type) => {
				if (!effects[label] && Math.abs(this.tween.data.target[type] - value) < ALLOWANCE_ERROR) {
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
		
		this.progress.reset();
		
		return this.tween
			.eventCallback('onUpdate', () => {
				this.progress.set(this.tween.totalProgress());
			})
			.eventCallback('onReverseComplete', () => {
				this.tween.vars.onUpdate();
				
				this.deleteTween(false);
			})
			.play();
	}
}();
