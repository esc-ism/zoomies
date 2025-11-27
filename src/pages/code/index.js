import demo from '@/demo';
import elements from '@/demo/elements';
import {Line} from '@/demo/lines/lines';
import {SVG_NAMESPACE, DEGREES} from '@/shared';

import flash from '../shared/flash';

import {ANGLE_RADIUS, BUILT_INS, CLASS_NAMES, CLASS_MAXIMISED, CLASS_TOOLTIP, CLASS_TOOLTIP_TOP, CLASS_TOOLTIP_BOTTOM, CLASS_TOOLTIP_LEFT, CLASS_TOOLTIP_RIGHT} from './consts';
import getButtons from './buttons';

import './css';

let globalScope;
let functions;
const visuals = [];

export const cleanup = () => {
	for (const visual of visuals) {
		visual();
	}
	
	visuals.length = 0;
};

const visualClasses = {
	Line: class extends Line {
		static template = Line.template.cloneNode();
		
		static {
			this.template.style.backgroundColor = 'white';
		}
	},
};

const getRoundedString = (number, pow = 4) => {
	const mult = Math.pow(10, pow);
	
	// Math.round(-0.5) is 0 😲
	if (number !== 0 && (number < 0 ? (number >= -0.5 / mult) : (number < 0.5 / mult))) {
		return number.toExponential(0);
	}
	
	return Math.round(number * mult) / mult;
};

const arrayify = (arg) => Array.isArray(arg) ? arg : [arg];

const refreshParams = [];

const reset = () => {
	globalScope = Object.fromEntries(Object.entries(BUILT_INS).map(([id, getValue]) => [id, getValue(demo)]));
	
	for (const visual of visuals) {
		visual.remove();
	}
	
	visuals.length = 0;
};

const getIndents = (depth) => {
	const elements = [];
	
	for (let i = 0; i < depth; ++i) {
		elements.push(getElement(CLASS_NAMES.indent));
	}
	
	return elements;
};

const makeMultiline = (elements, indent, statement, property) => {
	if (!statement.multiline) {
		return;
	}
	
	let lineLength = 1;
	let lineCount = 0;
	const lineMax = arrayify(getLineLength(statement, property));
	
	for (let i = 1; i < elements.length; i++) {
		if (statement.multiline && lineLength++ >= lineMax[lineCount % lineMax.length]) {
			if (i > 0) {
				lineCount++;
				lineLength = 1;
			}
			
			const whitespace = [document.createElement('br'), ...getIndents(indent + 1)];
			
			elements.splice(i, 0, ...whitespace);
			
			i += whitespace.length;
		}
	}
	
	elements.unshift(document.createElement('br'), ...getIndents(indent + 1));
	elements.push(document.createElement('br'), ...getIndents(indent));
};

export const register = (statements = []) => {
	reset();
	
	refreshParams.length = 0;
	
	functions = Object.fromEntries(statements.map((statement) => [
		statement.id,
		Object.assign((args, scope, indent, meta) => {
			const funcWrapper = getElement(CLASS_NAMES.clause);
			const funcElement = getElement(CLASS_NAMES.func);
			const argsElement = getElement(CLASS_NAMES.params);
			const body = document.createElement('div');
			
			if ('args' in statement) {
				const elements = statement.args.map((argId, i) => {
					const wrapper = getElement(CLASS_NAMES.csv);
					const arg = getElement(CLASS_NAMES.id);
					
					scope[argId] = {value: args.values[i], ...args.shapeData[i], element: args.unbroken[i]};
					
					makeHoverable(arg, argId, scope, meta, true);
					
					arg.innerText = argId;
					
					wrapper.appendChild(arg);
					
					return wrapper;
				});
				
				makeMultiline(elements, indent, statement, 'args');
				
				argsElement.append(...elements);
			}
			
			const {active} = meta;
			
			generate(body, statement.and, {...scope}, meta, indent + 1);
			
			funcWrapper.append(funcElement, argsElement, body, ...getIndents(indent));
			
			const result = {wrapper: funcWrapper, target: funcElement};
			
			if (statement.multilineResult) {
				result.multilineResult = statement.multilineResult;
			}
			
			if (active) {
				result.value = meta.return;
				result.shapeData = getOtherProps(statement, 'op', 'id', 'args', 'and', 'multiline', 'multilineResult');
				
				delete meta.return;
				meta.active = true;
			}
			
			return result;
		}, {multiline: statement.multiline ?? false}),
	]));
};

const getElement = (...classes) => {
	const element = document.createElement('span');
	
	element.classList.add(...classes);
	
	return element;
};

const parentIs = (meta, ...ops) => ops.includes(meta.branch[meta.branch.length - 2].op);

const getCombiner = (() => {
	const getCombined = (statement, scope, meta, indent, combiner) => {
		const elements = [];
		let value;
		
		for (const subStatement of statement.and) {
			const subIndent = elements.length === 0 || !statement.multiline ? indent : indent + 1;
			const result = interpret(subStatement, scope, meta, subIndent);
			
			if (elements.length === 0) {
				value = result.value;
			} else {
				value = combiner(value, result.value);
				
				elements.push(getElement(CLASS_NAMES[statement.op]));
				
				if (statement.multiline) {
					elements.push(document.createElement('br'), ...getIndents(indent + 1));
				}
			}
			
			elements.push(...result.elements);
		}
		
		return {value, elements};
	};
	
	return (combiner, clauseForcers = []) => (statement, scope, meta, indent) => {
		if (!parentIs(meta, ...clauseForcers)) {
			return getCombined(statement, scope, meta, indent, combiner);
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		const {value, elements} = getCombined(statement, scope, meta, indent, combiner);
		
		wrapper.append(...elements);
		
		return {value, elements: [wrapper]};
	};
})();

const getFunction = (getValue) => (statement, scope, meta, indent) => {
	const func = getElement(CLASS_NAMES[statement.op]);
	const args = getElement(CLASS_NAMES.args);
	const csvs = getCsvs(statement, scope, meta, indent);
	
	args.append(...csvs.elements);
	
	return {value: getValue(...csvs.values), elements: [func, args]};
};

const getLineLength = (statement, property = 'and') => {
	const {multiline, [property]: {length}} = statement;
	
	switch (typeof multiline) {
		case 'undefined': return Infinity;
		case 'boolean': return 1;
		case 'number': return Math.ceil(length / multiline);
	}
	
	// array
	return multiline;
};

const getCsvs = (statement, scope, meta, indent, property = 'and') => {
	if (!(property in statement)) {
		return {elements: []};
	}
	
	const elements = [];
	const values = [];
	const shapeData = [];
	
	const subIndent = indent + !!statement.multiline;
	
	for (const subStatement of arrayify(statement[property])) {
		const {elements: subElements, value, ...subShapeData} = interpret(subStatement, scope, meta, subIndent);
		const wrapper = getElement(CLASS_NAMES.csv);
		
		wrapper.append(...subElements);
		elements.push(wrapper);
		
		shapeData.push(subShapeData);
		
		if (meta.spread) {
			if (meta.active) {
				values.push(...value);
			}
			
			delete meta.spread;
		} else {
			values.push(value);
		}
	}
	
	const unbroken = [...elements];
	
	makeMultiline(elements, indent, statement, property);
	
	return {values, elements, unbroken, shapeData};
};

const getLine = ({value: length, doCenter = false, isPercent = true}, rotation, isX) => {
	const line = new visualClasses.Line(false, false, doCenter);
	
	line.setPosition({x: 0, y: 0});
	
	let height = length * 100;
	
	if (doCenter) {
		height /= 2;
	}
	
	if (!isPercent) {
		height /= demo.sizesImage.height;
	} else if (isX) {
		height *= demo.ratioImage;
	}
	
	if (height < 0) {
		line.setRotation(rotation + DEGREES[180]);
		
		height = -height;
	} else {
		line.setRotation(rotation);
	}
	
	line.setHeight(height);
	
	return () => line.remove();
};

const visualisers = {
	zoom: (scope, id) => {
		const {zoom} = demo;
		
		demo.zoom = scope[id].value;
		demo.applyZoom();
		
		demo.zoom = zoom;
		
		return () => {
			demo.applyZoom();
		};
	},
	x: (scope, id) => getLine(scope[id], 0, true),
	y: (scope, id) => getLine(scope[id], DEGREES[90]),
	xvp: (scope, id) => getLine(scope[id], DEGREES[90] - demo.rotation),
	yvp: (scope, id) => getLine(scope[id], DEGREES[180] - demo.rotation),
	position: (scope, id) => getLine(scope[id], scope[id].angle ?? 0),
	angle: (scope, id) => {
		// todo doesn't work correctly with negative angles?
		const value = scope[id].value;
		const curveX = ANGLE_RADIUS * Math.cos(value) * Math.max(1, demo.ratioImage);
		const curveY = -ANGLE_RADIUS * Math.sin(value) * Math.max(1, demo.ratioImageInverse);
		const sweep = value >= 0 ? 0 : 1;
		let rotation = 0;
		
		if (scope[id].fight ?? false) {
			rotation += demo.rotation - DEGREES[90];
		}
		
		if (scope[id].isBase ?? false) {
			rotation -= DEGREES[90];
		}
		
		const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
		
		svg.setAttribute('viewBox', `-${ANGLE_RADIUS} -${ANGLE_RADIUS} ${ANGLE_RADIUS * 2} ${ANGLE_RADIUS * 2}`);
		
		svg.style.position = 'absolute';
		svg.style.left = `${50 - ANGLE_RADIUS}%`;
		svg.style.top = `${50 - ANGLE_RADIUS}%`;
		svg.style.width = `${ANGLE_RADIUS * 2}%`;
		svg.style.height = `${ANGLE_RADIUS * 2}%`;
		svg.style.rotate = `${rotation}rad`;
		
		const path = document.createElementNS(SVG_NAMESPACE, 'path');
		
		path.setAttribute('fill', 'white');
		// path.setAttribute('stroke-linecap', 'round');
		// path.setAttribute('stroke-width', '2.5');
		path.setAttribute('d', `M0 0L${ANGLE_RADIUS} 0A${ANGLE_RADIUS} ${ANGLE_RADIUS} 0 ${sweep} ${sweep} ${curveX} ${curveY}Z`);
		
		svg.append(path);
		
		elements.imageContainer.appendChild(svg);
		
		return () => svg.remove();
	},
};

const visualise = (scope, ...ids) => {
	if (ids.length === 1) {
		const [id] = ids;
		
		return visualisers[scope[id].type](scope, id);
	}
	
	const [first, second] = (scope[ids[0]].type[0] === 'x' ? ids : [ids[1], ids[0]]).map((id) => scope[id]);
	
	if (first.value === 0) {
		return getLine({...second}, DEGREES[90]);
	}
	
	const angle = Math.atan(second.value / (first.value * demo.ratioImage));
	const value = Math.sqrt(Math.pow(first.value * demo.ratioImage, 2) + Math.pow(second.value, 2));
	
	return getLine({...first, value}, angle + (first.value < 0 ? DEGREES[180] : 0));
};

const getTitle = (value, type) => {
	if (typeof value !== 'number') {
		return value;
	}
	
	if (type === 'angle') {
		return `${getRoundedString(value / Math.PI)}π`;
	}
	
	return `${getRoundedString(value)}`;
};

const [setTitle, removeTitle] = (() => {
	let activeElement;
	
	const tooltip = document.createElement('div');
	
	tooltip.classList.add(CLASS_TOOLTIP);
	
	return [
		(element, title) => {
			element.addEventListener('click', (event) => {
				event.stopPropagation();
				
				// toggle off
				if (element.isSameNode(activeElement)) {
					removeTitle();
					
					return;
				}
				
				activeElement = element;
				
				const {offsetParent} = element;
				const scrollerLocal = offsetParent.firstChild;
				const scrollerGlobal = offsetParent.offsetParent;
				
				tooltip.style.removeProperty('display');
				
				const left = element.offsetLeft - scrollerLocal.scrollLeft + offsetParent.offsetLeft + element.offsetWidth / 2;
				
				if (left <= offsetParent.offsetLeft) {
					tooltip.style.left = `${element.offsetLeft - scrollerLocal.scrollLeft + offsetParent.offsetLeft + element.offsetWidth}px`;
					tooltip.style.top = `${element.offsetTop - scrollerLocal.scrollTop + offsetParent.offsetTop + element.offsetHeight / 2}px`;
					
					tooltip.classList.add(CLASS_TOOLTIP_RIGHT);
					tooltip.classList.remove(CLASS_TOOLTIP_LEFT, CLASS_TOOLTIP_TOP, CLASS_TOOLTIP_BOTTOM);
				} else if (left >= offsetParent.offsetLeft + offsetParent.clientWidth) {
					tooltip.style.left = `${element.offsetLeft - scrollerLocal.scrollLeft + offsetParent.offsetLeft}px`;
					tooltip.style.top = `${element.offsetTop - scrollerLocal.scrollTop + offsetParent.offsetTop + element.offsetHeight / 2}px`;
					
					tooltip.classList.add(CLASS_TOOLTIP_LEFT);
					tooltip.classList.remove(CLASS_TOOLTIP_RIGHT, CLASS_TOOLTIP_TOP, CLASS_TOOLTIP_BOTTOM);
				} else {
					tooltip.style.left = `${left}px`;
					
					const isTop = scrollerGlobal ?
							(element.offsetHeight / 2 + element.offsetTop - scrollerLocal.scrollTop + offsetParent.offsetTop - scrollerGlobal.scrollTop >= scrollerGlobal.clientHeight / 2) :
							(element.offsetHeight / 2 + element.offsetTop - scrollerLocal.scrollTop >= offsetParent.clientHeight / 2);
					
					if (isTop) {
						tooltip.classList.add(CLASS_TOOLTIP_TOP);
						tooltip.classList.remove(CLASS_TOOLTIP_LEFT, CLASS_TOOLTIP_RIGHT, CLASS_TOOLTIP_BOTTOM);
						
						tooltip.style.top = `${element.offsetTop - scrollerLocal.scrollTop + offsetParent.offsetTop}px`;
					} else {
						tooltip.classList.add(CLASS_TOOLTIP_BOTTOM);
						tooltip.classList.remove(CLASS_TOOLTIP_LEFT, CLASS_TOOLTIP_RIGHT, CLASS_TOOLTIP_TOP);
						
						tooltip.style.top = `${element.offsetTop - scrollerLocal.scrollTop + offsetParent.offsetTop + element.offsetHeight}px`;
					}
				}
				
				if (!scrollerGlobal) {
					tooltip.style.position = 'fixed';
				}
				
				tooltip.innerText = title;
				
				// todo place once
				element.offsetParent.parentElement.insertAdjacentElement('afterbegin', tooltip);
				
				window.addEventListener('scroll', () => {
					removeTitle();
				}, {once: true, capture: true});
			});
		},
		() => {
			tooltip.style.display = 'none';
			
			activeElement = undefined;
		},
	];
})();

let unhover;

const makeHoverable = (element, id, scope, meta, isVar) => {
	if (!meta.active) {
		return false;
	}
	
	const doShowVisuals = id && 'type' in scope[id] && typeof scope[id].value !== 'undefined';
	const hovered = [];
	
	if (doShowVisuals) {
		element.style.color = '#9bc99b';
	}
	
	if (id && 'value' in scope[id]) {
		setTitle(element, getTitle(scope[id].value, scope[id].type));
	}
	
	const callbacks = {
		hook: () => {
			unhover();
			
			return true;
		},
		event: () => {
			unhover();
		},
	};
	
	element.addEventListener('pointerenter', () => {
		if (unhover && !unhover(element)) {
			return;
		}
		
		const ids = [id];
		
		element.classList.add(CLASS_NAMES.hovered);
		
		if (isVar) {
			const data = scope[id];
			
			if ('element' in data && !element.isSameNode(data.element)) {
				hovered.push(data.element);
				
				data.element.classList.add(CLASS_NAMES.hovered);
			} else if ('pair' in data) {
				hovered.push(scope[data.pair].element);
				
				scope[data.pair].element.classList.add(CLASS_NAMES.hovered);
				
				ids.push(data.pair);
			}
		}
		
		unhover = (newElement) => {
			if (element.isSameNode(newElement)) {
				return false;
			}
			
			unhover = undefined;
			
			removeTitle();
			
			element.classList.remove(CLASS_NAMES.hovered);
			
			for (const source of hovered) {
				source.classList.remove(CLASS_NAMES.hovered);
			}
			
			if (doShowVisuals) {
				cleanup();
			}
			
			hovered.length = 0;
			
			demo.hooks.any.remove(callbacks.hook);
			element.removeEventListener('mouseleave', callbacks.event);
			window.removeEventListener('scroll', callbacks.event, true);
			
			return true;
		};
		
		demo.hooks.any.add(callbacks.hook);
		window.addEventListener('scroll', callbacks.event, {once: true, capture: true});
		element.addEventListener('mouseleave', callbacks.event, {once: true});
		
		if (doShowVisuals) {
			visuals.push(visualise(scope, ...ids));
		}
	});
	
	return true;
};

const getOtherProps = (object, ...exclusions) => {
	const excluded = {...object};
	
	for (const exclusion of exclusions) {
		delete excluded[exclusion];
	}
	
	return excluded;
};

const interpretters = {
	string: (id, scope, meta) => {
		if (id === '') {
			return {elements: []};
		}
		
		const element = getElement(CLASS_NAMES.id);
		
		element.innerText = id;
		
		makeHoverable(element, id, scope, meta, true);
		
		if (scope[id].pending) {
			scope[id].element = element;
			
			delete scope[id].pending;
		}
		
		return {...scope[id], elements: [element]};
	},
	number: (value) => {
		const element = getElement(CLASS_NAMES.number);
		
		element.innerText = value;
		
		return {value, elements: [element]};
	},
	boolean: (value) => {
		const element = getElement(CLASS_NAMES.bool);
		
		element.innerText = value;
		
		return {value, elements: [element]};
	},
	array: (statement, scope, meta, indent) => {
		const wrapper = getElement(CLASS_NAMES.array);
		const csvs = getCsvs(statement, scope, meta, indent);
		
		wrapper.append(...csvs.elements);
		
		return {value: csvs.values, elements: [wrapper]};
	},
	// todo get shapeData stuff from {op:'array'} values
	'=': (statement, scope, meta, indent) => {
		const {value, elements: operand, ...call} = interpret(statement.and, scope, meta, indent);
		const values = arrayify(value);
		
		const shapeData = {...(call.shapeData ?? {})};
		const refs = arrayify(statement.ref).map((id) => (scope[id]));
		
		if ('pair' in shapeData) {
			shapeData.pair = shapeData.pair.map((i) => statement.id[i]);
		}
		
		Object.assign(shapeData, getOtherProps(statement, 'op', 'id', 'and', 'multiline'));
		
		for (const [i, id] of arrayify(statement.id).entries()) {
			scope[id] = {...(refs?.[i] ?? {})};
			
			scope[id].value = values[i];
			scope[id].pending = true;
			
			for (const property in shapeData) {
				const value = arrayify(shapeData[property])[i];
				
				if (value !== undefined) {
					scope[id][property] = value;
				}
			}
		}
		
		const csvs = getCsvs({multiline: call.multilineResult ?? false, ...statement}, scope, meta, indent, 'id');
		const idWrapper = getElement(CLASS_NAMES[Array.isArray(statement.id) ? 'array' : 'wrapper']);
		
		idWrapper.append(...csvs.elements);
		
		return {elements: [idWrapper, getElement(CLASS_NAMES['=']), ...operand]};
	},
	'+': getCombiner((a, b) => a + b, ['==', '!=', '%', '*', '/']),
	'-': (() => {
		const combiner = getCombiner((a, b) => a - b, ['==', '!=', '%', '*', '/']);
		
		return (statement, scope, meta, indent) => {
			if (!Array.isArray(statement.and)) {
				const element = getElement(CLASS_NAMES.negative);
				
				const {value, elements: operand} = interpret(statement.and, scope, meta, indent);
				
				element.append(...operand);
				
				return {value: -value, elements: [element]};
			}
			
			return combiner(statement, scope, meta, indent);
		};
	})(),
	'!': (statement, scope, meta, indent) => {
		const element = getElement(CLASS_NAMES['!']);
		
		const {value, elements: operand} = interpret(statement.and, scope, meta, indent);
		
		element.append(...operand);
		
		return {value: !value, elements: [element]};
	},
	'*': getCombiner((a, b) => a * b, ['==', '!=', '%', '/']),
	'/': getCombiner((a, b) => a / b, ['==', '!=', '%']),
	'<=': getCombiner((a, b) => a <= b, ['==', '!=']),
	'>=': getCombiner((a, b) => a >= b, ['==', '!=']),
	'<': getCombiner((a, b) => a < b, ['==', '!=']),
	'>': getCombiner((a, b) => a > b, ['==', '!=']),
	'&&': getCombiner((a, b) => a && b, ['==', '!=']),
	'||': getCombiner((a, b) => a || b, ['==', '!=']),
	'!=': getCombiner((a, b) => a !== b),
	'==': getCombiner((a, b) => a === b),
	'%': getCombiner((a, b) => a % b, ['*', '/', '+', '-', '<=', '>=', '<', '>', '!=', '==']),
	if: (statement, scope, meta, indent) => {
		const elements = {
			condition: getElement(CLASS_NAMES.if),
			body: document.createElement('span'),
		};
		
		const {value, elements: conditionElements} = interpret(statement.and[0], scope, meta, indent);
		
		elements.condition.append(...conditionElements);
		
		const {active} = meta;
		
		if (!value) {
			meta.active = false;
		}
		
		generate(elements.body, statement.and.slice(1), {...scope}, meta, indent + 1);
		
		if (active && !('return' in meta)) {
			meta.active = true;
		}
		
		elements.condition.classList.add(CLASS_NAMES.branch[value ? 'accept' : 'reject']);
		
		return {value, elements: [elements.condition, document.createElement('br'), elements.body]};
	},
	'?': (statement, scope, meta, indent) => {
		const subIndent = indent + !!statement.multiline;
		
		const {value: conditionValue, elements: conditionElements} = interpret(statement.and[0], scope, meta, indent);
		const {value: truthyValue, elements: truthyElements} = interpret(statement.and[1], scope, {...meta, active: meta.active && conditionValue}, subIndent);
		const {value: falsyValue, elements: falsyElements} = interpret(statement.and[2], scope, {...meta, active: meta.active && !conditionValue}, subIndent);
		
		const conditionWrapper = getElement(CLASS_NAMES.branch[conditionValue ? 'accept' : 'reject']);
		
		conditionWrapper.append(...conditionElements);
		
		for (const element of (conditionValue ? falsyElements : truthyElements)) {
			element.classList.add(CLASS_NAMES.inactive);
		}
		
		const getSeperator = statement.multiline ? () => [document.createElement('br'), ...getIndents(indent + 1)] : () => [];
		
		let elements = [
			conditionWrapper,
			getElement(CLASS_NAMES['?']),
			...getSeperator(),
			...truthyElements,
			getElement(CLASS_NAMES[':']),
			...getSeperator(),
			...falsyElements,
		];
		
		if (parentIs(meta, '+', '-', '*', '/', '<=', '>=', '<', '>', '&&', '||', '!=', '==', '%')) {
			const wrapper = getElement(CLASS_NAMES.clause);
			
			wrapper.append(...elements);
			
			elements = [wrapper];
		}
		
		return {value: conditionValue ? truthyValue : falsyValue, elements};
	},
	'...': (statement, scope, meta, indent) => {
		const element = getElement(CLASS_NAMES['...']);
		
		const {value, elements: operand} = interpret(statement.and, scope, meta, indent);
		
		meta.spread = true;
		
		return {value, elements: [element, ...operand]};
	},
	abs: (statement, scope, meta, indent) => {
		const element = getElement(CLASS_NAMES.abs);
		
		const {value, elements: subElements} = interpret(statement.and, scope, meta, indent);
		
		element.append(...subElements);
		
		return {value: Math.abs(value), elements: [element]};
	},
	floor: getFunction(Math.floor),
	min: getFunction(Math.min),
	max: getFunction(Math.max),
	sin: getFunction(Math.sin),
	cos: getFunction(Math.cos),
	tan: getFunction(Math.tan),
	atan: getFunction(Math.atan),
	root: (statement, scope, meta, indent) => {
		const element = getElement(CLASS_NAMES.root);
		const {value, elements} = interpret(statement.and, scope, meta, indent);
		
		if (typeof statement.and !== 'object') {
			return {value: Math.sqrt(value), elements: [element, ...elements]};
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		wrapper.append(...elements);
		
		return {value: Math.sqrt(value), elements: [element, wrapper]};
	},
	pow: (statement, scope, meta, indent) => {
		const element = document.createElement('sup');
		const {value, elements} = interpret(statement.and, scope, meta, indent);
		const power = statement.power ?? '2';
		
		element.innerText = power;
		
		if (typeof statement.and !== 'object') {
			return {value: Math.pow(value, power), elements: [...elements, element]};
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		wrapper.append(...elements);
		
		return {value: Math.pow(value, power), elements: [wrapper, element]};
	},
	call: (statement, scope, meta, indent) => {
		const id = getElement(CLASS_NAMES.id, CLASS_NAMES.evocation);
		const args = getElement(CLASS_NAMES.args);
		
		id.innerText = statement.id;
		
		const csvs = getCsvs({multiline: functions[statement.id].multiline, ...statement}, scope, meta, indent);
		
		args.append(...csvs.elements);
		
		const {target, wrapper, ...result} = functions[statement.id](csvs, {...scope}, indent, meta);
		
		if (makeHoverable(id, undefined, scope, meta)) {
			makeHoverable(target, undefined, scope, meta);
			
			id.style.cursor = 'pointer';
			
			id.addEventListener('click', () => {
				id.replaceWith(wrapper);
				
				removeTitle();
			});
			
			target.addEventListener('click', () => {
				wrapper.replaceWith(id);
				
				removeTitle();
			});
		}
		
		return {...result, elements: [id, args]};
	},
	return: (statement, scope, meta, indent) => {
		const elements = [getElement(CLASS_NAMES.return)];
		
		const result = interpret(statement.and, scope, meta, indent);
		
		elements.push(...result.elements);
		
		const value = result.value;
		
		if (meta.active) {
			meta.return = value;
			
			meta.active = false;
		}
		
		return {elements};
	},
};

const interpret = (statement, scope, meta, indent) => {
	meta.branch.push(statement);
	
	const result = interpretters[statement?.op ?? typeof statement](statement, scope, meta, indent);
	
	meta.branch.pop();
	
	return result;
};

const generate = (parent, snippet, scope = globalScope, meta = {branch: [], active: true}, indent = 0) => {
	for (const statement of snippet) {
		const {active} = meta;
		const {elements} = interpret(statement, scope, meta, indent);
		
		if (!active) {
			for (const element of elements) {
				element.classList.add(CLASS_NAMES.inactive);
			}
		}
		
		if (elements.length > 0) {
			parent.append(...getIndents(indent), ...elements);
		}
		
		parent.appendChild(document.createElement('br'));
	}
	
	parent.lastChild.remove();
};

const generateButtons = (parent, statements) => {
	const buttons = getButtons();
	
	parent.insertAdjacentElement('beforebegin', buttons.wrapper);
	
	refreshParams.push({parent, statements});
	
	buttons.refresh.addEventListener('click', () => {
		reset();
		
		flash(parent.parentElement.parentElement);
		
		for (const args of refreshParams) {
			for (let i = args.parent.children.length - 1; i >= 0; --i) {
				args.parent.children[i].remove();
			}
			
			generate(args.parent, args.statements);
		}
		
		removeTitle();
	});
	
	buttons.max.addEventListener('click', () => {
		buttons.max.replaceWith(buttons.min);
		
		parent.parentElement.parentElement.classList.add(CLASS_MAXIMISED);
		
		removeTitle();
	});
	
	buttons.min.addEventListener('click', () => {
		buttons.min.replaceWith(buttons.max);
		
		parent.parentElement.parentElement.classList.remove(CLASS_MAXIMISED);
		
		removeTitle();
	});
};

export default (parent, statements) => {
	generateButtons(parent, statements);
	
	generate(parent, statements);
};
