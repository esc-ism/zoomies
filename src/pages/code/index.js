import {Line, Connection} from '@/demo/lines/lines';

import getButton from './button';

import {DEGREES} from '@/shared';
import {BUILT_INS, CLASS_NAMES} from './consts';

import './css';

let init;
let demo;
let globalScope;
let functions;
const visuals = [];

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
				const value = args.values[i];
				
				scope[argId] = {value: typeof value === 'string' ? scope[value] : value, element: arg};
				
				makeHoverable(arg, argId, scope, ...args.unwrapped[i]);
				
				arg.innerText = argId;
				
				wrapper.appendChild(arg);
				argsElement.appendChild(wrapper);
			}
			
			const {active} = meta;
			
			generate(body, statement.and, scope, indent + 1, meta);
			
			funcWrapper.append(funcElement, argsElement, body, ...getIndents(indent));
			
			const value = meta.return;
			
			delete meta.return;
			meta.active = active;
			
			return {value, wrapper: funcWrapper, target: funcElement};
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
		let value;
		const elements = [];
		
		for (const subStatement of statement.and) {
			const result = interpret(subStatement, scope, indent, meta);
			
			if (elements.length === 0) {
				value = result.value;
			} else {
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

const getCsvs = (statement, scope, indent, meta, property = 'and') => {
	if (!(property in statement)) {
		return {elements: []};
	}
	
	const unwrapped = [];
	const elements = [];
	const values = [];
	
	const {multiline = false} = statement;
	
	if (multiline) {
		elements.push(document.createElement('br'));
	}
	
	for (const result of arrayify(statement[property]).map((statement) => interpret(statement, scope, indent + multiline, meta))) {
		const wrapper = getElement(CLASS_NAMES.csv);
		
		if (multiline) {
			wrapper.append(...getIndents(indent + 1));
			
			wrapper.style.display = 'block';
		}
		
		unwrapped.push(result.elements);
		
		wrapper.append(...result.elements);
		elements.push(wrapper);
		
		values.push(result.value);
	}
	
	if (multiline) {
		elements.push(...getIndents(indent));
	}
	
	return {values, elements, unwrapped};
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

const makeHoverable = (element, id, scope, ...sources) => {
	if ('return' in scope) {
		return false;
	}
	
	// if ('type' in scope[id]) {
	// const visuals = visualisers[scope[id].type](demo, id, scope);
	// }
	element.style.cursor = 'pointer';
	
	if (id && 'value' in scope[id]) {
		if (typeof scope[id].value === 'boolean') {
			element.setAttribute('title', scope[id].value);
		} else if ('type' in scope[id] && scope[id].type === 'angle') {
			element.setAttribute('title', `${getRoundedString(scope[id].value / Math.PI)}π`);
		} else {
			element.setAttribute('title', getRoundedString(scope[id].value));
		}
	}
	
	element.addEventListener('mouseenter', () => {
		element.classList.add(CLASS_NAMES.hovered);
		
		for (const source of sources) {
			source.classList.add(CLASS_NAMES.hovered);
		}
		// for (const visual of visuals) {
		// 	visual.show();
		// }
	});
	
	element.addEventListener('mouseout', () => {
		element.classList.remove(CLASS_NAMES.hovered);
		
		for (const source of sources) {
			source.classList.remove(CLASS_NAMES.hovered);
		}
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
		
		const sources = 'element' in scope[id] ? [scope[id].element] : [];
		
		makeHoverable(element, id, scope, ...sources);
		
		if (scope[id].pending) {
			scope[id].element = element;
			
			delete scope[id].pending;
		}
		
		return {value: scope[id].value, elements: [element]};
	},
	number: (value) => {
		const element = getElement(CLASS_NAMES.number);
		
		element.innerText = value;
		
		return {value, elements: [element]};
	},
	'=': (statement, scope, indent, meta) => {
		const {value, elements: operand} = interpret(statement.and, scope, indent, meta);
		const values = arrayify(value);
		
		for (const [i, id] of arrayify(statement.id).entries()) {
			scope[id] = {value: values[i], pending: true};
			
			if ('type' in statement) {
				scope[id].type = statement.type;
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
		
		if (active && !meta.return) {
			meta.active = true;
		}
		
		elements.condition.classList.add(CLASS_NAMES.branch[value ? 'accept' : 'reject']);
		
		return {value, elements: [elements.condition, document.createElement('br'), elements.body]};
	},
	'?': (statement, scope, indent, meta) => {
		const {value: conditionValue, elements: conditionElements} = interpret(statement.and[0], scope, indent, meta);
		const {value: truthyValue, elements: truthyElements} = interpret(statement.and[1], scope, indent, {...meta, active: meta.active && conditionValue});
		const {value: falsyValue, elements: falsyElements} = interpret(statement.and[2], scope, indent, {...meta, active: meta.active && !conditionValue});
		
		const conditionWrapper = getElement(CLASS_NAMES.branch[conditionValue ? 'accept' : 'reject']);
		
		conditionWrapper.append(...conditionElements);
		
		for (const element of (conditionValue ? falsyElements : truthyElements)) {
			element.classList.add(CLASS_NAMES.inactive);
		}
		
		return {value: conditionValue ? truthyValue : falsyValue, elements: [
			conditionWrapper,
			getElement(CLASS_NAMES['?']),
			...truthyElements,
			getElement(CLASS_NAMES[':']),
			...falsyElements,
		]};
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
		
		const expansion = functions[statement.id](csvs, {...scope}, indent, meta);
		
		if (makeHoverable(id, undefined, scope)) {
			makeHoverable(expansion.target, undefined, scope);
			
			const newline = document.createElement('br');
			
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
			const csvs = getCsvs(statement, scope, indent, meta);
			
			value = csvs.values;
			
			array.append(...csvs.elements);
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

const generate = (parent, snippet, scope = globalScope, indent = 0, meta = {branch: [], active: true}) => {
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
		
		if (elements.length > 0) {
			parent.append(...getIndents(indent), ...elements);
		}
		
		parent.appendChild(document.createElement('br'));
	}
	
	if (indent > 0 && meta.branch[meta.branch.length - 1].id === 'getIntersection') {
		console.log({...scope});
	}
};

export const generateWhenReady = async (parent, statements) => {
	await init;
	
	generate(parent, statements);
};
