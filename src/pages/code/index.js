import {Line, Connection} from '@/demo/lines/lines';

import getButtons from './buttons';

import {DEGREES, SVG_NAMESPACE} from '@/shared';
import {ANGLE_RADIUS, BUILT_INS, CLASS_NAMES, CLASS_MAXIMISED} from './consts';

import './css';

let init;
let demo;
let globalScope;
let functions;
const visuals = [];

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

export const register = (newDemo, statements) => {
	demo = newDemo;
	
	functions = Object.fromEntries(statements.map((statement) => [
		statement.id,
		(args, scope, indent, meta) => {
			const funcWrapper = getElement(CLASS_NAMES.clause);
			const funcElement = getElement(CLASS_NAMES.func);
			const argsElement = getElement(CLASS_NAMES.params);
			const body = document.createElement('div');
			
			for (const [i, argId] of statement.args?.entries() ?? []) {
				const wrapper = getElement(CLASS_NAMES.csv);
				const arg = getElement(CLASS_NAMES.id);
				
				scope[argId] = {value: args.values[i], ...args.shapeData[i], element: arg};
				
				makeHoverable(arg, argId, scope, meta, ...args.unwrapped[i]);
				
				arg.innerText = argId;
				
				wrapper.appendChild(arg);
				argsElement.appendChild(wrapper);
			}
			
			const {active} = meta;
			
			generate(body, statement.and, scope, indent + 1, meta);
			
			funcWrapper.append(funcElement, argsElement, body, ...getIndents(indent));
			
			if (active) {
				const value = meta.return;
				
				delete meta.return;
				
				meta.active = true;
				
				return {value, shapeData: getOtherProps(statement, 'op', 'id', 'args', 'and'), wrapper: funcWrapper, target: funcElement};
			}
			
			return {wrapper: funcWrapper, target: funcElement};
		},
	]));
	
	init = demo.init().then(() => reset());
};

const getElement = (...classes) => {
	const element = document.createElement('span');
	
	element.classList.add(...classes);
	
	return element;
};

const getCombiner = (() => {
	const getCombined = (statement, scope, indent, meta, combiner) => {
		const elements = [];
		let value;
		
		for (const subStatement of statement.and) {
			const subIndent = elements.length === 0 || !statement.multiline ? indent : indent + 1;
			const result = interpret(subStatement, scope, subIndent, meta);
			
			if (elements.length === 0) {
				value = result.value;
			} else {
				if (statement.multiline) {
					elements.push(document.createElement('br'), ...getIndents(indent + 1));
				}
				
				elements.push(getElement(CLASS_NAMES[statement.op]));
				
				value = combiner(value, result.value);
			}
			
			elements.push(...result.elements);
		}
		
		return {value, elements};
	};
	
	return (combiner, clauseForcers = []) => (statement, scope, indent, meta) => {
		if (!clauseForcers.includes(meta.branch[meta.branch.length - 2].op)) {
			return getCombined(statement, scope, indent, meta, combiner);
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		const {value, elements} = getCombined(statement, scope, indent, meta, combiner);
		
		wrapper.append(...elements);
		
		return {value, elements: [wrapper]};
	};
})();

const getFunction = (getValue) => (statement, scope, indent, meta) => {
	const func = getElement(CLASS_NAMES[statement.op], CLASS_NAMES.evocation);
	const args = getElement(CLASS_NAMES.args);
	const csvs = getCsvs(statement, scope, indent, meta);
	
	args.append(...csvs.elements);
	
	return {value: getValue(...csvs.values), elements: [func, args]};
};

const getInverseFunction = (getValue) => {
	const getResult = getFunction(getValue);
	
	return (...args) => {
		const result = getResult(...args);
		const sup = document.createElement('sup');
		
		sup.innerText = '-1';
		
		result.elements[0].appendChild(sup);
		
		return result;
	};
};

const getLineLength = (statement, property = 'and') => {
	const {multiline, [property]: {length}} = statement;
	
	if (!multiline) {
		return Infinity;
	}
	
	if (typeof multiline === 'boolean') {
		return 1;
	}
	
	return Math.ceil(length / multiline);
};

const getCsvs = (statement, scope, indent, meta, property = 'and') => {
	if (!(property in statement)) {
		return {elements: []};
	}
	
	const unwrapped = [];
	const elements = [];
	const values = [];
	const shapeData = [];
	
	const subIndent = indent + !!statement.multiline;
	const lineLength = getLineLength(statement, property);
	
	for (const [i, subStatement] of arrayify(statement[property]).entries()) {
		const {elements: subElements, value, ...subShapeData} = interpret(subStatement, scope, subIndent, meta);
		const wrapper = getElement(CLASS_NAMES.csv);
		
		if (statement.multiline && i % lineLength === 0) {
			wrapper.append(document.createElement('br'), ...getIndents(indent + 1));
		}
		
		unwrapped.push(subElements);
		
		wrapper.append(...subElements);
		elements.push(wrapper);
		
		shapeData.push(subShapeData);
		
		if (meta.spread && meta.active) {
			values.push(...value);
			
			delete meta.spread;
		} else {
			values.push(value);
		}
	}
	
	if (statement.multiline) {
		elements.push(document.createElement('br'), ...getIndents(indent));
	}
	
	return {values, elements, unwrapped, shapeData};
};

const getLine = ({value: length, doCenter = false, isPercent = true}, rotation, isWidth = false) => {
	const line = new visualClasses.Line(demo, false, false, doCenter);
	
	line.setPosition({x: 0, y: 0});
	
	let height = length * 100;
	
	if (isWidth) {
		height *= demo.ratioImage;
	}
	
	if (doCenter) {
		height /= 2;
	}
	
	if (!isPercent) {
		height /= demo.imageDimensions.height;
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
		const {zoom, position: {x, y}} = demo;
		
		demo.zoom = scope[id].value;
		// demo.position.x = demo.position.y = 0;
		
		demo.applyZoom();
		demo.constrainPosition({zoom: true});
		demo.applyPosition();
		
		return () => {
			demo.zoom = zoom;
			demo.position.x = x;
			demo.position.y = y;
			
			demo.applyZoom();
			demo.constrainPosition({zoom: true});
			demo.applyPosition();
		};
	},
	x: (scope, id) => getLine(scope[id], 0, true),
	y: (scope, id) => getLine(scope[id], DEGREES[90], false),
	xvp: (scope, id) => getLine(scope[id], DEGREES[90] - demo.rotation, true),
	yvp: (scope, id) => getLine(scope[id], DEGREES[180] - demo.rotation, false),
	position: (scope, id) => getLine(scope[id], scope[id].angle ?? 0),
	angle: (scope, id) => {
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
		
		demo.elements.imageWrapper.appendChild(svg);
		
		return () => svg.remove();
	},
};

const visualise = (scope, ...ids) => {
	if (ids.length === 1) {
		const [id] = ids;
		
		return visualisers[scope[id].type](scope, id);
	}
	
	const [first, second] = (scope[ids[0]].type[0] === 'x' ? ids : [ids[1], ids[0]]).map((id) => scope[id]);
	
	const angle = Math.atan(second.value / (first.value * demo.ratioImage));
	const value = Math.sqrt(Math.pow(first.value * demo.ratioImage, 2) + Math.pow(second.value, 2));
	
	return getLine({...first, value}, angle + (first.value < 0 ? DEGREES[180] : 0));
};

const getTitle = (value, type) => {
	if (typeof value === 'boolean') {
		return value;
	}
	
	if (type === 'angle') {
		return `${getRoundedString(value / Math.PI)}π`;
	}
	
	return `${getRoundedString(value)}`;
};

const makeHoverable = (element, id, scope, meta, isVar) => {
	if (!meta.active) {
		return false;
	}
	
	const doShowVisuals = id && 'type' in scope[id];
	const visuals = [];
	let hovered = [];
	
	if (doShowVisuals) {
		element.style.color = '#9fd49f';
	}
	
	element.style.cursor = 'pointer';
	
	if (id && 'value' in scope[id]) {
		element.setAttribute('title', getTitle(scope[id].value, scope[id].type));
	}
	
	element.addEventListener('mouseenter', () => {
		const ids = [id];
		
		element.classList.add(CLASS_NAMES.hovered);
		
		if (isVar) {
			const data = scope[id];
			
			if ('element' in data && !element.isSameNode(data.element)) {
				hovered.push(data.element);
				
				data.element.classList.add(CLASS_NAMES.hovered);
			}
			
			if ('pair' in data) {
				hovered.push(scope[data.pair].element);
				
				scope[data.pair].element.classList.add(CLASS_NAMES.hovered);
				
				ids.push(data.pair);
			}
		}
		
		if (doShowVisuals) {
			visuals.push(visualise(scope, ...ids));
		}
	});
	
	element.addEventListener('mouseleave', () => {
		element.classList.remove(CLASS_NAMES.hovered);
		
		for (const source of hovered) {
			source.classList.remove(CLASS_NAMES.hovered);
		}
		
		for (const visual of visuals) {
			visual();
		}
		
		visuals.length = 0;
		hovered.length = 0;
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
	string: (id, scope, indent, meta) => {
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
	array: (statement, scope, indent, meta) => {
		const wrapper = getElement(CLASS_NAMES.array);
		const csvs = getCsvs(statement, scope, indent, meta);
		
		wrapper.append(...csvs.elements);
		
		return {value: csvs.values, elements: [wrapper]};
	},
	'=': (statement, scope, indent, meta) => {
		const {value, elements: operand, ...call} = interpret(statement.and, scope, indent, meta);
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
		
		const csvs = getCsvs(statement, scope, indent, meta, 'id');
		
		if (!Array.isArray(statement.id)) {
			return {elements: [...csvs.elements, getElement(CLASS_NAMES['=']), ...operand]};
		}
		
		const idWrapper = getElement(CLASS_NAMES.array);
		
		idWrapper.append(...csvs.elements);
		
		return {elements: [idWrapper, getElement(CLASS_NAMES['=']), ...operand]};
	},
	'+': getCombiner((a, b) => a + b, ['%', '*', '/']),
	'-': (() => {
		const combiner = getCombiner((a, b) => a - b, ['%', '*', '/']);
		
		return (statement, scope, indent, meta) => {
			if (!Array.isArray(statement.and)) {
				const element = getElement(CLASS_NAMES.negative);
				
				const {value, elements: operand} = interpret(statement.and, scope, indent, meta);
				
				element.append(...operand);
				
				return {value: -value, elements: [element]};
			}
			
			return combiner(statement, scope, indent, meta);
		};
	})(),
	'!': (statement, scope, indent, meta) => {
		const element = getElement(CLASS_NAMES['!']);
		
		const {value, elements: operand} = interpret(statement.and, scope, indent, meta);
		
		element.append(...operand);
		
		return {value: !value, elements: [element]};
	},
	'*': getCombiner((a, b) => a * b, ['%', '/']),
	'/': getCombiner((a, b) => a / b, ['%']),
	'<=': getCombiner((a, b) => a <= b),
	'>=': getCombiner((a, b) => a >= b),
	'<': getCombiner((a, b) => a < b),
	'>': getCombiner((a, b) => a > b),
	'&&': getCombiner((a, b) => a && b),
	'||': getCombiner((a, b) => a || b),
	'!=': getCombiner((a, b) => a !== b),
	'%': getCombiner((a, b) => a % b, ['*', '/', '+', '-', '<=', '>=', '<', '>', '!=']),
	if: (statement, scope, indent, meta) => {
		const elements = {
			condition: getElement(CLASS_NAMES.if),
			body: document.createElement('span'),
		};
		
		const {value, elements: conditionElements} = interpret(statement.and[0], scope, indent, meta);
		
		elements.condition.append(...conditionElements);
		
		const {active} = meta;
		
		if (!value) {
			meta.active = false;
		}
		
		generate(elements.body, statement.and.slice(1), {...scope}, indent + 1, meta);
		
		if (active && !('return' in meta)) {
			meta.active = true;
		}
		
		elements.condition.classList.add(CLASS_NAMES.branch[value ? 'accept' : 'reject']);
		
		return {value, elements: [elements.condition, document.createElement('br'), elements.body]};
	},
	'?': (statement, scope, indent, meta) => {
		const subIndent = indent + !!statement.multiline;
		
		const {value: conditionValue, elements: conditionElements} = interpret(statement.and[0], scope, indent, meta);
		const {value: truthyValue, elements: truthyElements} = interpret(statement.and[1], scope, subIndent, {...meta, active: meta.active && conditionValue});
		const {value: falsyValue, elements: falsyElements} = interpret(statement.and[2], scope, subIndent, {...meta, active: meta.active && !conditionValue});
		
		const conditionWrapper = getElement(CLASS_NAMES.branch[conditionValue ? 'accept' : 'reject']);
		
		conditionWrapper.append(...conditionElements);
		
		for (const element of (conditionValue ? falsyElements : truthyElements)) {
			element.classList.add(CLASS_NAMES.inactive);
		}
		
		const getSeperator = statement.multiline ? () => [document.createElement('br'), ...getIndents(indent + 1)] : () => [];
		
		return {value: conditionValue ? truthyValue : falsyValue, elements: [
			conditionWrapper,
			getElement(CLASS_NAMES['?']),
			...getSeperator(),
			...truthyElements,
			getElement(CLASS_NAMES[':']),
			...getSeperator(),
			...falsyElements,
		]};
	},
	'...': (statement, scope, indent, meta) => {
		const element = getElement(CLASS_NAMES['...']);
		
		const {value, elements: operand} = interpret(statement.and, scope, indent, meta);
		
		element.append(...operand);
		
		meta.spread = true;
		
		return {value, elements: [element]};
	},
	abs: (statement, scope, indent, meta) => {
		const element = getElement(CLASS_NAMES.abs);
		
		const {value, elements: subElements} = interpret(statement.and, scope, indent, meta);
		
		element.append(...subElements);
		
		return {value: Math.abs(value), elements: [element]};
	},
	floor: getFunction(Math.floor),
	min: getFunction(Math.min),
	max: getFunction(Math.max),
	sin: getFunction(Math.sin),
	cos: getFunction(Math.cos),
	tan: getFunction(Math.tan),
	atan: getInverseFunction(Math.atan),
	root: (statement, scope, indent, meta) => {
		const element = getElement(CLASS_NAMES.root);
		const {value, elements} = interpret(statement.and, scope, indent, meta);
		
		if (typeof statement.and !== 'object') {
			return {value: Math.sqrt(value), elements: [element, ...elements]};
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		wrapper.append(...elements);
		
		return {value: Math.sqrt(value), elements: [element, wrapper]};
	},
	pow: (statement, scope, indent, meta) => {
		const element = document.createElement('sup');
		const {value, elements} = interpret(statement.and, scope, indent, meta);
		const power = statement.power ?? '2';
		
		element.innerText = power;
		
		if (typeof statement.and !== 'object') {
			return {value: Math.pow(value, power), elements: [...elements, element]};
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		wrapper.append(...elements);
		
		return {value: Math.pow(value, power), elements: [wrapper, element]};
	},
	call: (statement, scope, indent, meta) => {
		const id = getElement(CLASS_NAMES.id, CLASS_NAMES.evocation);
		const args = getElement(CLASS_NAMES.args);
		
		id.innerText = statement.id;
		
		const csvs = getCsvs(statement, scope, indent, meta);
		
		args.append(...csvs.elements);
		
		const {target, wrapper, ...result} = functions[statement.id](csvs, {...scope}, indent, meta);
		
		id.setAttribute('title', getTitle(result.value, result.type));
		
		if (makeHoverable(id, undefined, scope, meta)) {
			makeHoverable(target, undefined, scope, meta);
			
			const newline = document.createElement('br');
			const {multiline} = meta.branch[meta.branch.length - 2];
			
			id.addEventListener('click', () => {
				id.replaceWith(wrapper);
				
				if (!multiline) {
					args.insertAdjacentElement('afterend', newline);
				}
			});
			
			target.addEventListener('click', () => {
				wrapper.replaceWith(id);
				
				newline.remove();
			});
		}
		
		return {...result, elements: [id, args]};
	},
	return: (statement, scope, indent, meta) => {
		const elements = [getElement(CLASS_NAMES.return)];
		
		let value;
		
		if (Array.isArray(statement.and)) {
			const array = getElement(CLASS_NAMES.array);
			const csvs = getCsvs(statement, scope, indent, meta);
			
			value = csvs.values;
			
			array.append(...csvs.elements);
			elements.push(array);
		} else {
			const result = interpret(statement.and, scope, indent, meta);
			
			elements.push(...result.elements);
			
			value = result.value;
		}
		
		if (meta.active) {
			meta.return = value;
			
			meta.active = false;
		}
		
		return {elements};
	},
};

const interpret = (statement, scope, indent, meta) => {
	meta.branch.push(statement);
	
	const result = interpretters[statement?.op ?? typeof statement](statement, scope, indent, meta);
	
	meta.branch.pop();
	
	return result;
};

const generate = (parent, snippet, scope = globalScope, indent = 0, meta = {branch: [], active: true}) => {
	for (const statement of snippet) {
		const {active} = meta;
		const {elements} = interpret(statement, scope, indent, meta);
		
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
		
		for (const args of refreshParams) {
			for (let i = args.parent.children.length - 1; i >= 0; --i) {
				args.parent.children[i].remove();
			}
			
			generate(args.parent, args.statements);
		}
	});
	
	buttons.max.addEventListener('click', () => {
		buttons.max.replaceWith(buttons.min);
		
		parent.parentElement.parentElement.classList.add(CLASS_MAXIMISED);
	});
	
	buttons.min.addEventListener('click', () => {
		buttons.min.replaceWith(buttons.max);
		
		parent.parentElement.parentElement.classList.remove(CLASS_MAXIMISED);
	});
};

export const generateWhenReady = async (parent, statements) => {
	await init;
	
	generateButtons(parent, statements);
	
	generate(parent, statements);
};
