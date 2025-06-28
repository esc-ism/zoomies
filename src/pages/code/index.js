import {Line, Connection} from '@/demo/lines/lines';

import getButton from './button';

import {DEGREES} from '@/shared';
import {BUILT_INS, CLASS_NAMES} from './consts';

import './css';

let demo;
let globalScope = {};

const functions = {};
const visuals = [];

const getRoundedString = (number, pow = 3) => {
	const mult = Math.pow(10, pow);
	
	return Math.round(number * mult) / mult;
};

const arrayify = (arg) => Array.isArray(arg) ? arg : [arg];

const refreshParams = [];

export const reset = (newDemo) => {
	if (newDemo) {
		demo = newDemo;
	}
	
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

export const register = (statement, ...remaining) => {
	functions[statement.id] = (args, scope, indent, meta) => {
		const funcWrapper = getElement(CLASS_NAMES.clause);
		const funcElement = getElement(CLASS_NAMES.func);
		const argsElement = getElement(CLASS_NAMES.params);
		const body = document.createElement('div');
		
		for (const [i, argId] of statement.args?.entries() ?? []) {
			if (typeof args[i] === 'string') {
				scope[argId] = scope[args[i]];
			} else {
				scope[argId] = {value: args[i]};
			}
			
			const wrapper = getElement(CLASS_NAMES.csv);
			const arg = getElement(CLASS_NAMES.id);
			
			makeHoverable(arg, argId, scope);
			
			arg.innerText = argId;
			
			wrapper.appendChild(arg);
			argsElement.appendChild(wrapper);
		}
		
		const {active} = meta;
		
		generate(body, statement.and, scope, indent + 1, meta);
		
		funcWrapper.append(funcElement, argsElement, body);
		
		const value = meta.return;
		
		delete meta.return;
		meta.active = active;
		
		return {value, wrapper: funcWrapper, target: funcElement};
	};
	
	if (remaining.length > 0) {
		register(...remaining);
	}
};

const getElement = (...classes) => {
	const element = document.createElement('span');
	
	element.classList.add(...classes);
	
	return element;
};

const getCombiner = (() => {
	const getCombined = (statement, scope, indent, meta, combiner) => {
		let value;
		const elements = [];
		
		for (const subStatement of statement.and) {
			const result = interpret(subStatement, scope, indent, meta);
			
			if (elements.length === 0) {
				value = result.value;
			} else {
				value = combiner(value, result.value);
			}
			
			const wrapper = getElement(CLASS_NAMES[statement.op]);
			
			wrapper.append(...result.elements);
			
			elements.push(wrapper);
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
	
	const values = arrayify(statement.and).reduce((values, statement) => {
		const wrapper = getElement(CLASS_NAMES.csv);
		const {value, elements} = interpret(statement, scope, indent, meta);
		
		wrapper.append(...elements);
		args.appendChild(wrapper);
		
		values.push(value);
		
		return values;
	}, []);
	
	return {value: getValue(...values), elements: [func, args]};
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

const getComparater = (comparater) => (statement, scope, indent, meta) => {
	const element = getElement(CLASS_NAMES[statement.op]);
	
	const results = statement.and.map((subStatement) => interpret(subStatement, scope, indent, meta));
	
	return {value: comparater(...results.map(({value}) => value)), elements: [...results[0].elements, element, ...results[1].elements]};
};

const getLine = (demo, length, rotation) => {
	const line = new Line(demo, false, false, false);
	
	line.setPosition(0, 0);
	line.setHeight(length);
	line.setRotation(rotation);
	
	line.hide();
	
	return line;
};

const visualisers = {
	zoom: () => [],
	x: (demo, id, scope) => [getLine(demo, scope[id].value, 0)],
	y: (demo, id, scope) => [getLine(demo, scope[id].value, DEGREES[90])],
	xvp: (demo, id, scope) => [getLine(demo, scope[id].value, -demo.rotation)],
	yvp: (demo, id, scope) => [getLine(demo, scope[id].value, DEGREES[90] - demo.rotation)],
	position: (demo, id, scope) => [getLine(demo, scope[id].value, scope[id].angle ?? 0)],
	angle: (demo, id, scope) => {
		return [];
		const line = new Line(demo, false, false, false);
		
		line.setPosition(0, 0);
		line.setHeight(scope[id].value);
		line.setRotation(scope[id].angle ?? 0);
		
		return [line];
	},
};

const makeHoverable = (element, id, scope) => {
	if ('return' in scope) {
		return false;
	}
	
	// if ('type' in scope[id]) {
	// const visuals = visualisers[scope[id].type](demo, id, scope);
	// }
	element.style.cursor = 'pointer';
	
	if (id && 'value' in scope[id]) {
		element.setAttribute('title', getRoundedString(scope[id].value));
	}
	
	element.addEventListener('mouseenter', () => {
		element.classList.add(CLASS_NAMES.hovered);
		
		// for (const visual of visuals) {
		// 	visual.show();
		// }
	});
	
	element.addEventListener('mouseout', () => {
		element.classList.remove(CLASS_NAMES.hovered);
	});
	
	return true;
};

const interpretters = {
	string: (id, scope) => {
		if (id === '') {
			return {elements: []};
		}
		
		const element = getElement(CLASS_NAMES.id);
		
		element.innerText = id;
		
		makeHoverable(element, id, scope);
		
		return {value: scope[id].value, elements: [element]};
	},
	number: (value) => {
		const element = getElement(CLASS_NAMES.number);
		
		element.innerText = value;
		
		return {value, elements: [element]};
	},
	'=': (statement, scope, indent, meta) => {
		const ids = arrayify(statement.id);
		
		const idElements = [];
		
		const {value, elements: operand} = interpret(statement.and, scope, indent, meta);
		const values = arrayify(value);
		
		for (const [i, id] of ids.entries()) {
			const idElement = getElement(CLASS_NAMES.id);
			
			idElement.innerText = id;
			
			scope[id] = {value: values[i]};
			
			if ('type' in statement) {
				scope[id].type = statement.type;
			}
			
			makeHoverable(idElement, id, scope);
			
			idElements.push(idElement);
		}
		
		if (ids.length === 1) {
			return {elements: [idElements[0], getElement(CLASS_NAMES['=']), ...operand]};
		}
		
		const idWrapper = getElement(CLASS_NAMES.array);
		
		for (const element of idElements) {
			const wrapper = getElement(CLASS_NAMES.csv);
			
			wrapper.appendChild(element);
			idWrapper.appendChild(wrapper);
		}
		
		return {elements: [idWrapper, getElement(CLASS_NAMES['=']), ...operand]};
	},
	'+': getCombiner((a, b) => a + b, ['*', '/']),
	'-': (() => {
		const combiner = getCombiner((a, b) => a - b, ['*', '/']);
		
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
	'*': getCombiner((a, b) => a * b, ['/']),
	'/': getCombiner((a, b) => a / b),
	'<=': getComparater((a, b) => a <= b),
	'>=': getComparater((a, b) => a >= b),
	'<': getComparater((a, b) => a < b),
	'>': getComparater((a, b) => a > b),
	'!=': getComparater((a, b) => a !== b),
	if: (statement, scope, indent, meta) => {
		const elements = {
			header: getElement(CLASS_NAMES.if),
			body: document.createElement('div'),
		};
		
		elements.header.classList.add(CLASS_NAMES.if);
		
		const {value, elements: headerElements} = interpret(statement.and[0], scope, indent, meta);
		
		elements.header.append(...headerElements);
		
		const {active} = meta;
		
		if (!value) {
			meta.active = false;
		}
		
		generate(elements.body, statement.and.slice(1), {...scope}, indent + 1, meta);
		
		if (active && !meta.return) {
			meta.active = true;
		}
		
		elements.header.classList.add(CLASS_NAMES.branch[value ? 'accept' : 'reject']);
		
		return {value, elements: [elements.header, document.createElement('br'), elements.body]};
	},
	abs: (statement, scope, indent, meta) => {
		const element = getElement(CLASS_NAMES.abs);
		
		const {value, elements: subElements} = interpret(statement.and, scope, indent, meta);
		
		element.append(...subElements);
		
		return {value: Math.abs(value), elements: [element]};
	},
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
		
		const values = [];
		
		for (const arg of statement.and ?? []) {
			const wrapper = getElement(CLASS_NAMES.csv);
			
			const {value, elements: [element]} = interpret(arg, scope, indent, meta);
			
			values.push(value);
			
			wrapper.appendChild(element);
			args.appendChild(wrapper);
		}
		
		const expansion = functions[statement.id](values, {...scope}, indent, meta);
		
		if (makeHoverable(id, undefined, scope)) {
			makeHoverable(expansion.target, undefined, scope);
			
			let newline = document.createElement('br');
			
			id.addEventListener('click', () => {
				id.replaceWith(expansion.wrapper);
				
				args.insertAdjacentElement('afterend', newline);
			});
			
			expansion.target.addEventListener('click', () => {
				expansion.wrapper.replaceWith(id);
				
				newline.remove();
			});
		}
		
		return {value: expansion.value, elements: [id, args]};
	},
	return: (statement, scope, indent, meta) => {
		const elements = [getElement(CLASS_NAMES.return)];
		let value;
		
		if (!Array.isArray(statement.and)) {
			const result = interpret(statement.and, scope, indent, meta);
			
			elements.push(...result.elements);
			
			value = result.value;
		} else {
			const array = getElement(CLASS_NAMES.array);
			
			value = [];
			
			for (const result of statement.and.map((statement) => interpret(statement, scope, indent, meta))) {
				const wrapper = getElement(CLASS_NAMES.csv);
				
				wrapper.append(...result.elements);
				array.appendChild(wrapper);
				
				value.push(result.value);
			}
			
			elements.push(array);
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

export const generate = (parent, snippet, scope = globalScope, indent = 0, meta = {branch: [], active: true}) => {
	if (indent === 0) {
		for (let i = parent.children.length - 1; i >= 0; --i) {
			parent.children[i].remove();
		}
		
		const button = getButton();
		
		parent.appendChild(button);
		
		refreshParams.push([parent, snippet]);
		
		button.addEventListener('click', () => {
			const oldRefreshParams = [...refreshParams];
			
			refreshParams.length = 0;
			
			reset();
			
			for (const args of oldRefreshParams) {
				generate(...args);
			}
		});
	}
	
	for (const statement of snippet) {
		const {active} = meta;
		const {elements} = interpret(statement, scope, indent, meta);
		
		if (!active) {
			for (const element of elements) {
				element.classList.add(CLASS_NAMES.inactive);
			}
		}
		
		parent.append(...getIndents(indent), ...elements, document.createElement('br'));
	}
};
