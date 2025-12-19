import {gsap} from 'gsap';

import {getTheta, DEGREES, getAngleDiff, SUB_PIXEL_BS} from '@/shared';
import {isVertical, list as orientation} from '@/shared/orientation';

import Readout from './readout';
import Target from './target';
import Progress from './progress';
import elements from './elements';
import {ALLOWANCE_CLICK, DURATION_CAP_GETTERS, MULTIPLIERS_SCROLL} from './consts';

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
	
	remove(listener, isGlobal = false) {
		const listeners = this.listeners[isGlobal ? 'global' : 'local'];
		
		for (let i = listeners.length - 1; i >= 0; --i) {
			if (listener === listeners[i]) {
				listeners.splice(i, 1);
				
				return;
			}
		}
	}
	
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
	
	hooks = {
		ratio: new ActionHook(),
		any: new ActionHook(),
	};
	
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
		
		this.setOutline();
		
		for (const [key, listener] of Object.entries(this.listeners)) {
			this.hooks[key] = new ActionHook();
			
			this.listeners[key] = (...args) => {
				window.setTimeout(() => {
					this.hooks[key].emit();
				}, 0);
				
				this.hooks.any.emit();
				
				return listener(...args);
			};
		}
		
		this.hooks.any.add(() => {
			if (startPosition) {
				startPosition = undefined;
				
				this.target.hide();
			}
		}, true);
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
		
		return this.#init.then(() => {
			this.system.constrainPosition({position: true, ratio: true});
			this.applyPosition();
			
			this.target.set(startPosition);
		});
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
			
			const stop = () => {
				removeClickNegater?.();
				removeMoveListener();
				removeStopListener();
				removeCancelListener();
				
				delete events[pointerId];
				
				if (--pointerCount === 0) {
					onFinish?.();
				}
			};
			
			const removeStopListener = addPointerListener('pointerup', () => {
				stop();
				
				if (buttons === 2) {
					cancelRightClick();
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
			
			const removeCancelListener = addPointerListener('pointercancel', () => {
				stop();
				
				failedClick = true;
			});
		});
	}
	
	set ratioImage(ratio) {
		this._ratioImage = ratio;
		this.ratioImageInverse = 1 / this._ratioImage;
		
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
		
		this.hooks.ratio.emit();
		
		if (doApply) {
			this.system.constrainPosition({ratio: true, ratioImage: true});
			this.applyPosition();
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
	
	applyPosition() {
		this.elements.imageContainer.style.translate = `${-this.position.x * 100}% ${this.position.y * 100}%`;
		this.elements.imageContainer.style.transformOrigin = `${(0.5 + this.position.x) * 100}% ${(0.5 - this.position.y) * 100}%`;
		
		this.readout.setPosition(this);
	}
	
	setOutline() {
		this.elements.image.style.outline = `round(up, ${1 / this.zoom}px, ${SUB_PIXEL_BS}px) solid currentcolor`;
	}
	
	applyZoom() {
		this.elements.imageContainer.style.scale = `${this.zoom}`;
		
		this.setOutline();
		
		this.readout.setZoom(this);
	}
	
	applyRotation() {
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
			
			this.target.hide();
		} else {
			this.tweenUpdate.then(() => {
				this.target.hide();
			});
		}
		
		delete this.tween;
	}
	
	getTweenTarget() {
		const target = {
			x: this.position.x,
			y: this.position.y,
		};
		let hasActions = false;
		let hasTargetActions = false;
		let actions = {};
		let effects = {};
		
		const doUpdate = (() => {
			let willUpdate = false;
			
			const update = () => {
				if (hasActions) {
					for (const action of Object.values(actions)) {
						action();
					}
					
					if (this.position.x !== target.x || this.position.y !== target.y) {
						this.position.x = target.x;
						this.position.y = target.y;
						
						effects.position = true;
					}
					
					if (!hasTargetActions) {
						target.xTarget = this.position.x;
						target.yTarget = this.position.y;
					}
					
					this.system.constrainPosition(effects);
					this.applyPosition();
					
					hasActions = false;
				}
				
				if (hasTargetActions) {
					this.target.set({x: target.xTarget, y: target.yTarget});
					
					hasTargetActions = false;
				}
				
				actions = {};
				effects = {};
				willUpdate = false;
			};
			
			return () => {
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
		
		const getDefinition = (initial, label, act) => (() => {
			let value = initial;
			
			return {
				set: (newValue) => {
					if (act) {
						actions[label] = act.bind(null, newValue);
					}
					
					if (label) {
						hasActions = true;
						
						effects[label] = true;
					} else {
						hasTargetActions = true;
					}
					
					doUpdate();
					
					value = newValue;
				},
				get: () => value,
			};
		})();
		
		Object.defineProperty(target, 'xTarget', getDefinition(target.x));
		Object.defineProperty(target, 'yTarget', getDefinition(target.y));
		
		if (this.target.isHidden) {
			Object.defineProperty(target, 'x', getDefinition(this.position.x, 'position'));
			Object.defineProperty(target, 'y', getDefinition(this.position.y, 'position'));
		} else {
			Object.defineProperty(target, 'x', getDefinition(this.target.x, 'position'));
			Object.defineProperty(target, 'y', getDefinition(this.target.y, 'position'));
		}
		
		Object.defineProperty(target, 'ratio', getDefinition(this.ratio, 'ratio', (ratio) => {
			this._ratioImage = this.ratioViewport / ratio;
			this.ratioImageInverse = 1 / this._ratioImage;
			
			this.updateSizesImage(false);
		}));
		
		Object.defineProperty(target, 'ratioImage', getDefinition(this.ratioImage, 'ratio', (ratio) => {
			this._ratioImage = ratio;
			this.ratioImageInverse = 1 / this._ratioImage;
			
			this.updateSizesImage(false);
		}));
		
		Object.defineProperty(target, 'rotation', getDefinition(this.rotation, 'rotation', (rotation) => {
			this.rotation = rotation;
			
			this.constrainRotation();
			this.applyRotation();
		}));
		
		Object.defineProperty(target, 'zoom', getDefinition(this.zoom, 'zoom', (zoom) => {
			this.zoom = zoom;
			
			this.applyZoom();
		}));
		
		return target;
	}
	
	setTween(...targets) {
		this.hooks.any.emit();
		
		if (this.tween) {
			this.tween.kill();
			
			window.clearTimeout(this.#tweenUpdateId);
		}
		
		const timeline = gsap.timeline({paused: true, data: {}});
		
		timeline.data.target = this.getTweenTarget();
		
		const effects = {};
		
		for (const [target, {
			duration: targetDuration = 1,
			position = '>',
			cutRotation = true,
			isPositionUpdate = false,
			onUpdate,
			...vars
		} = {}] of targets) {
			const to = {};
			
			let maxDuration = 0;
			
			if (isPositionUpdate) {
				effects.x = true;
				effects.y = true;
			}
			
			const record = (type, value, altType = false) => {
				if (typeof value === 'number' && !effects[type] && (!altType || !effects[altType])) {
					const cappedDuration = DURATION_CAP_GETTERS[type](value, timeline.data.target[type]);
					
					maxDuration = Math.max(maxDuration, cappedDuration);
				} else {
					maxDuration = Infinity;
				}
				
				to[type] = value;
				effects[type] = true;
			};
			
			for (const [type, value] of Object.entries(target)) {
				switch (type) {
					case 'position':
						if (typeof value === 'object') {
							record('x', value.x);
							record('y', value.y);
						} else {
							record('x', value);
							record('y', value);
						}
						
						break;
					case 'x':
					case 'y':
						record(type, value);
						
						break;
					case 'target':
						if (typeof value === 'object') {
							record('xTarget', value.x, 'x');
							record('yTarget', value.y, 'y');
						} else {
							record('xTarget', value, 'x');
							record('yTarget', value, 'y');
						}
						
						break;
					case 'xTarget':
						record(type, value, 'x');
						
						break;
					case 'yTarget':
						record(type, value, 'y');
						
						break;
					case 'rotation':
						if (cutRotation) {
							if (value > this.rotation) {
								record(type, value - this.rotation <= DEGREES[180] ? value : value - DEGREES[360]);
							} else {
								record(type, this.rotation - value <= DEGREES[180] ? value : value + DEGREES[360]);
							}
							
							break;
						}
					
					// eslint-disable-next-line no-fallthrough
					default:
						record(type, value);
				}
			}
			
			const duration = Math.min(targetDuration, maxDuration);
			
			if (duration === 0) {
				timeline.set(timeline.data.target, {...to, ...vars}, position);
				
				if (onUpdate) {
					timeline.add(() => {
						this.tweenUpdate.then(() => {
							onUpdate({ratio: 1, parent: timeline});
						});
					}, '>');
				}
			} else {
				const tween = gsap.to(timeline.data.target, {ease: 'power1.inOut', ...to, ...vars, duration});
				
				if (onUpdate) {
					tween.eventCallback('onUpdate', () => {
						this.tweenUpdate.then(() => {
							onUpdate(tween);
						});
					});
				}
				
				timeline.add(tween, position);
			}
		}
		
		this.progress.reset();
		
		this.tweenEnd = new Promise((resolve) => {
			timeline.eventCallback('onReverseComplete', () => {
				timeline.revert();
				
				this.deleteTween(false);
				
				this.progress.reset();
				
				resolve();
			});
		}).then(() => this.tweenUpdate);
		
		return this.tween = timeline
			.eventCallback('onUpdate', () => {
				this.progress.set(timeline.totalProgress());
			})
			.play();
	}
}();
