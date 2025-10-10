import {addRule} from '@/shared/css';

import {CLASS_NAMES, CLASS_MAXIMISED} from './consts';
import {CLASS_CODE} from '../consts';

const addPseudoRule = (selector, content, {display = 'inline', ...styles} = {}) => addRule(selector, {display, ...styles, content: `"${content}"`});
const addKeywordPseudoRule = (selector, content, display = 'inline') => addRule(selector, {display, content: `"${content}"`, color: 'rgb(219 142 56)'});

// infix binary ops
for (const [name, content = name] of [
	['?'],
	[':'],
	['='],
	['||'],
	['&&'],
	['<'],
	['>'],
	['<=', '⩽'],
	['>=', '⩾'],
	['!='],
	['=='],
	['+'],
	['-'],
	['*', '×'],
	['/', '÷'],
	['%'],
]) {
	addPseudoRule(`.${CLASS_NAMES[name]}::after`, ` ${content} `);
	addPseudoRule([`br + .${CLASS_NAMES[name]}::after`, `.${CLASS_NAMES.indent} + .${CLASS_NAMES[name]}::after`], `${content} `);
}

addPseudoRule(`.${CLASS_NAMES.negative}::before`, '-');
addPseudoRule(`.${CLASS_NAMES['!']}::before`, '!');
addPseudoRule(`.${CLASS_NAMES['...']}::before`, '...');
addPseudoRule(`.${CLASS_NAMES.csv}:has(~ .${CLASS_NAMES.csv})::after`, ', ');

addKeywordPseudoRule(`.${CLASS_NAMES.return}::after`, 'return ');
addKeywordPseudoRule(`.${CLASS_NAMES.func}::after`, 'function');

addRule(`.${CLASS_NAMES.func}`, {cursor: 'pointer'});

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
for (const name of ['floor', 'min', 'max', 'sin', 'cos', 'tan']) {
	addPseudoRule(`.${CLASS_NAMES[name]}::before`, `${name}`);
}

// inverse functions
for (const name of [/* 'asin', 'acos', */'atan']) {
	addPseudoRule(`.${CLASS_NAMES[name]}::before`, `${name.slice(1)}`);
	addPseudoRule(`.${CLASS_NAMES[name]}::after`, '-1', {
		'vertical-align': 'super',
		'font-size': 'smaller',
	});
}

addPseudoRule(`.${CLASS_NAMES.root}::before`, '√');

addKeywordPseudoRule(`.${CLASS_NAMES.if}::before`, 'if ');
addPseudoRule(`.${CLASS_NAMES.if}::after`, ':');

addPseudoRule(`.${CLASS_NAMES.indent}::after`, '  ');

addRule(`.${CLASS_NAMES['=']} > :last-child::after`, {display: 'block'});

// dynamic ops
for (const [name, color] of [
	['bool', '#90b0f9'],
	['number', '#90b0f9'],
]) {
	addRule(`.${CLASS_NAMES[name]}`, {color});
}

addRule(`.${CLASS_NAMES.evocation}`, {color: 'rgb(212 188 0)'});

for (const [name, colour] of [['accept', 'rgb(0 255 0 / 10%)'], ['reject', 'rgb(255 0 0 / 10%)']]) {
	addRule(`.${CLASS_NAMES.branch[name]} > :not(.${CLASS_NAMES.inactive} *)`, {'background-image': `linear-gradient(${colour}, ${colour})`});
}

addRule([
	`.${CLASS_NAMES.hovered}:not(.${CLASS_NAMES.csv})`,
	`.${CLASS_NAMES.hovered}.${CLASS_NAMES.csv} > *`,
], {'background-color': 'rgb(255 255 255 / 25%)'});

addRule(`.${CLASS_NAMES.inactive}:not(.${CLASS_NAMES.inactive} *)`, {opacity: 0.4});

addRule(`p.${CLASS_MAXIMISED}`, {
	position: 'fixed',
	top: '0',
	left: '0',
	width: '100vw',
	height: '100vh',
	margin: '0',
	'border-radius': '0',
	'z-index': 2,
});

addRule(`.${CLASS_MAXIMISED} > *`, {
	overflow: 'auto',
	height: '100%',
});

addRule(`.${CLASS_CODE}:not(.${CLASS_MAXIMISED}) > *`, {
	'max-height': 'calc(100vh - 2em)',
	overscroll: 'contain',
});
