import {addRule} from '@css';

import {CLASS_NAMES} from './consts';

const addPseudoRule = (selector, content, display = 'inline') => addRule(selector, {display, content: `"${content}"`});
const addKeywordPseudoRule = (selector, content, display = 'inline') => addRule(selector, {display, content: `"${content}"`, color: 'rgb(219 142 56)'});

// infix binary ops
for (const [name, content = name] of [
	['='],
	['<'],
	['>'],
	['<=', '⩽'],
	['>=', '⩾'],
]) {
	addPseudoRule(`.${CLASS_NAMES[name]}::after`, ` ${content} `);
}

addPseudoRule(`.${CLASS_NAMES.negative}::before`, '-');
addKeywordPseudoRule(`.${CLASS_NAMES.return}::after`, 'return ');
addKeywordPseudoRule(`.${CLASS_NAMES.func}::after`, 'function');

// infix binary ops
for (const [name, content = name] of [
	['+'],
	['-'],
	['*', '×'],
	['/', '÷'],
]) {
	addPseudoRule(`.${CLASS_NAMES[name]}:has(+ .${CLASS_NAMES[name]})::after`, ` ${content} `);
}

addPseudoRule(`.${CLASS_NAMES.csv}:has(+ .${CLASS_NAMES.csv})::after`, ', ');

// wrappers
for (const [name, before, after = before] of [
	['abs', '|'],
	['array', '[', ']'],
	['args', '(', ')'],
	['params', '(', '):'],
	['clause', '(', ')'],
]) {
	addPseudoRule(`.${CLASS_NAMES[name]}::before`, before);
	addPseudoRule(`.${CLASS_NAMES[name]}::after`, after);
}

// functions
for (const name of ['max', 'sin', 'cos', 'tan']) {
	addPseudoRule(`.${CLASS_NAMES[name]}::before`, `${name}`);
}

// inverse functions
for (const name of [/* 'asin', 'acos', */'atan']) {
	addPseudoRule(`.${CLASS_NAMES[name]}::before`, `${name.slice(1)}`);
}

addPseudoRule(`.${CLASS_NAMES.root}::before`, '√');

addKeywordPseudoRule(`.${CLASS_NAMES.if}::before`, 'if ');
addPseudoRule(`.${CLASS_NAMES.if}::after`, ':');

addPseudoRule(`.${CLASS_NAMES.indent}::before`, '  ');

addRule(`.${CLASS_NAMES['=']} > :last-child::after`, {display: 'block'});

// dynamic ops
for (const [name, color] of [
	// ['id', 'rgb(200 228 217)'],
	// ['number', 'rgb(167 216 230)'],
	['number', 'rgb(125 159 255)'],
]) {
	addRule(`.${CLASS_NAMES[name]}`, {color});
}

addRule(`.${CLASS_NAMES.evocation}`, {color: 'rgb(212 188 0)'});

addRule(`.${CLASS_NAMES.branch.accept} *`, {'background-color': 'rgb(41 255 0 / 20%)'});
addRule(`.${CLASS_NAMES.branch.reject} *`, {'background-color': 'rgb(255 0 0 / 20%)'});

addRule(`.${CLASS_NAMES.hovered}`, {'background-color': 'rgb(255 255 255 / 25%)'});
