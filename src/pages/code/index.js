import {Line, Connection} from '@/demo/lines/lines';

import {DEGREES} from '@/shared';
import {BUILT_INS, CLASS_NAMES} from './consts';

import './css';

let globalScope = {};
const functions = {};
const visuals = [];

const arrayify = (arg) => Array.isArray(arg) ? arg : [arg];

export const reset = (demo) => {
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
	// todo
	functions[statement.id] = (args, demo, scope, indent) => {
		const funcWrapper = getElement(CLASS_NAMES.clause);
		const funcElement = getElement(CLASS_NAMES.func);
		const argsElement = getElement(CLASS_NAMES.params);
		
		for (const [i, argId] of statement.args?.entries() ?? []) {
			if (typeof args[i] === 'string') {
				scope[argId] = scope[args[i]];
			} else {
				scope[argId] = {value: args[i]};
			}
			
			const wrapper = getElement(CLASS_NAMES.csv);
			const arg = getElement(CLASS_NAMES.id);
			
			makeHoverable(arg, argId, demo, scope);
			
			arg.innerText = argId;
			
			wrapper.appendChild(arg);
			argsElement.appendChild(wrapper);
		}
		
		const body = document.createElement('div');
		
		generate(body, statement.and, demo, scope, indent + 1);
		
		funcWrapper.append(funcElement, argsElement, body);
		
		return {value: scope.return, wrapper: funcWrapper, target: funcElement};
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
	const getCombined = (statement, demo, scope, indent, combiner) => {
		let value;
		const elements = [];
		
		for (const subStatement of statement.and) {
			const result = interpret(subStatement, demo, scope, indent, statement.op);
			
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
	
	return (combiner, doClause = false) => (statement, demo, scope, indent, parentOp) => {
		switch (parentOp) {
			case '/':
			case '*':
				if (doClause) {
					break;
				}
			
			// eslint-disable-next-line no-fallthrough
			default:
				return getCombined(statement, demo, scope, indent, combiner);
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		const {value, elements} = getCombined(statement, demo, scope, indent, combiner);
		
		wrapper.append(...elements);
		
		return {value, elements: [wrapper]};
	};
})();

const getFunction = (getValue) => (statement, demo, scope, indent) => {
	const func = getElement(CLASS_NAMES[statement.op], CLASS_NAMES.evocation);
	const args = getElement(CLASS_NAMES.args);
	
	const values = arrayify(statement.and).reduce((values, statement) => {
		const wrapper = getElement(CLASS_NAMES.csv);
		const {value, elements} = interpret(statement, demo, scope, indent);
		
		wrapper.append(...elements);
		args.appendChild(wrapper);
		
		values.push(value);
		
		return values;
	}, []);
	
	return {value: getValue(...values), elements: [func, args]};
};

const getInverseFunction = (getValue) => {
	const getResult = getFunction(getValue);
	
	return (statement, demo, scope) => {
		const result = getResult(statement, demo, scope);
		const sup = document.createElement('sup');
		
		sup.innerText = '-1';
		
		result.elements[0].appendChild(sup);
		
		return result;
	};
};

const getComparater = (comparater) => (statement, demo, scope, indent) => {
	const element = getElement(CLASS_NAMES[statement.op]);
	
	const results = statement.and.map((subStatement) => interpret(subStatement, demo, scope, indent));
	
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

const makeHoverable = (element, id, demo, scope) => {
	// if ('type' in scope[id]) {
	// const visuals = visualisers[scope[id].type](demo, id, scope);
	// }
	element.style.cursor = 'pointer';
	
	if (id && 'value' in scope[id]) {
		element.setAttribute('title', scope[id].value);
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
};

const interpretters = {
	string: (id, demo, scope) => {
		if (id === '') {
			return {elements: []};
		}
		
		const element = getElement(CLASS_NAMES.id);
		
		element.innerText = id;
		
		makeHoverable(element, id, demo, scope);
		
		return {value: scope[id].value, elements: [element]};
	},
	number: (value) => {
		const element = getElement(CLASS_NAMES.number);
		
		element.innerText = value;
		
		return {value, elements: [element]};
	},
	'=': (statement, demo, scope, indent) => {
		const ids = arrayify(statement.id);
		
		const idElements = [];
		
		const {value, elements: operand} = interpret(statement.and, demo, scope, indent);
		const values = arrayify(value);
		
		for (const [i, id] of ids.entries()) {
			const idElement = getElement(CLASS_NAMES.id);
			
			idElement.innerText = id;
			
			scope[id] = {value: values[i]};
			
			if ('type' in statement) {
				scope[id].type = statement.type;
			}
			
			makeHoverable(idElement, id, demo, scope);
			
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
	'+': getCombiner((a, b) => a + b, true),
	'-': (() => {
		const combiner = getCombiner((a, b) => a - b, true);
		
		return (statement, demo, scope, indent, parentOp) => {
			if (!Array.isArray(statement.and)) {
				const element = getElement(CLASS_NAMES.negative);
				
				const {value, elements: operand} = interpret(statement.and, demo, scope, indent);
				
				element.append(...operand);
				
				return {value: -value, elements: [element]};
			}
			
			return combiner(statement, demo, scope, indent, parentOp);
		};
	})(),
	'*': getCombiner((a, b) => a * b),
	'/': getCombiner((a, b) => a / b),
	'<=': getComparater((a, b) => a <= b),
	'>=': getComparater((a, b) => a >= b),
	'<': getComparater((a, b) => a < b),
	'>': getComparater((a, b) => a > b),
	if: (statement, demo, scope, indent) => {
		const elements = {
			header: getElement(CLASS_NAMES.if),
			body: document.createElement('div'),
		};
		
		elements.header.classList.add(CLASS_NAMES.if);
		
		const {value, elements: headerElements} = interpret(statement.and[0], demo, scope, indent);
		
		elements.header.append(...headerElements);
		
		generate(elements.body, statement.and.slice(1), demo, (value && !('return' in scope)) ? scope : {...scope}, indent + 1);
		
		elements.header.classList.add(CLASS_NAMES.branch[value ? 'accept' : 'reject']);
		
		return {value, elements: [elements.header, document.createElement('br'), elements.body]};
	},
	abs: (statement, demo, scope, indent) => {
		const element = getElement(CLASS_NAMES.abs);
		
		const {value, elements: subElements} = interpret(statement.and, demo, scope, indent);
		
		element.append(...subElements);
		
		return {value: Math.abs(value), elements: [element]};
	},
	max: getFunction(Math.max),
	sin: getFunction(Math.sin),
	cos: getFunction(Math.cos),
	tan: getFunction(Math.tan),
	atan: getInverseFunction(Math.atan),
	root: (statement, demo, scope, indent) => {
		const element = getElement(CLASS_NAMES.root);
		const {value, elements} = interpret(statement.and, demo, scope, indent);
		
		if (typeof statement.and !== 'object') {
			return {value: Math.sqrt(value), elements: [element, ...elements]};
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		wrapper.append(...elements);
		
		return {value: Math.sqrt(value), elements: [element, wrapper]};
	},
	pow: (statement, demo, scope, indent) => {
		const element = document.createElement('sup');
		const {value, elements} = interpret(statement.and, demo, scope, indent);
		const power = statement.power ?? '2';
		
		element.innerText = power;
		
		if (typeof statement.and !== 'object') {
			return {value: Math.pow(value, power), elements: [...elements, element]};
		}
		
		const wrapper = getElement(CLASS_NAMES.clause);
		
		wrapper.append(...elements);
		
		return {value: Math.pow(value, power), elements: [wrapper, element]};
	},
	call: (statement, demo, scope, indent) => {
		const id = getElement(CLASS_NAMES.id, CLASS_NAMES.evocation);
		const args = getElement(CLASS_NAMES.args);
		
		id.innerText = statement.id;
		
		const values = [];
		
		for (const arg of statement.and ?? []) {
			const wrapper = getElement(CLASS_NAMES.csv);
			
			const {value, elements: [element]} = interpret(arg, demo, scope, indent);
			
			values.push(value);
			
			wrapper.appendChild(element);
			args.appendChild(wrapper);
		}
		
		const expansion = functions[statement.id](values, demo, {...scope}, indent);
		
		makeHoverable(id);
		makeHoverable(expansion.target);
		
		id.addEventListener('click', () => {
			id.replaceWith(expansion.wrapper);
		});
		
		expansion.target.addEventListener('click', () => {
			expansion.wrapper.replaceWith(id);
		});
		
		return {value: expansion.value, elements: [id, args]};
	},
	return: (statement, demo, scope, indent) => {
		const elements = [getElement(CLASS_NAMES.return)];
		
		if (!Array.isArray(statement.and)) {
			const result = interpret(statement.and, demo, scope, indent);
			
			elements.push(...result.elements);
			
			if (!('return' in scope)) {
				scope.return = result.value;
			}
			
			return {elements};
		}
		
		const array = getElement(CLASS_NAMES.array);
		const value = [];
		
		for (const result of statement.and.map((statement) => interpret(statement, demo, scope, indent))) {
			const wrapper = getElement(CLASS_NAMES.csv);
			
			wrapper.append(...result.elements);
			array.appendChild(wrapper);
			
			value.push(result.value);
		}
		
		elements.push(array);
		
		if (!('return' in scope)) {
			scope.return = value;
		}
		
		return {elements};
	},
};

const interpret = (statement, demo, scope, indent, parentOp) => interpretters[statement?.op ?? typeof statement](statement, demo, scope, indent, parentOp);

export const generate = (parent, snippet, demo, scope = globalScope, indent = 0) => {
	for (const statement of snippet) {
		const {elements} = interpret(statement, demo, scope, indent);
		
		parent.append(...getIndents(indent), ...elements, document.createElement('br'));
	}
};
