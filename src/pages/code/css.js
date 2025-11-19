import {addRule} from '@/shared/css';

import {
	CLASS_NAMES, CLASS_MAXIMISED, CLASS_TOOLTIP,
	CLASS_TOOLTIP_BOTTOM, CLASS_TOOLTIP_TOP, CLASS_TOOLTIP_LEFT, CLASS_TOOLTIP_RIGHT,
} from './consts';

const addPseudoRule = (selector, content, {display = 'inline', ...styles} = {}) => addRule(selector, {display, ...styles, content: `"${content}"`});
const addKeywordPseudoRule = (selector, content, display = 'inline') => addRule(selector, {display, content: `"${content}"`, color: '#d69f61'});

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
addRule([`.${CLASS_NAMES.bool}`, `.${CLASS_NAMES.number}`, `.${CLASS_TOOLTIP}`], {color: '#9cbaff'});

addRule(`.${CLASS_NAMES.evocation}`, {color: '#cac17d'});

for (const [name, colour] of [['accept', '#00ff001a'], ['reject', '#ff00001a']]) {
	addRule(`.${CLASS_NAMES.branch[name]} > :not(.${CLASS_NAMES.inactive} *)`, {'background-image': `linear-gradient(${colour}, ${colour})`});
}

addRule([
	`.${CLASS_NAMES.hovered}:not(.${CLASS_NAMES.csv})`,
	`.${CLASS_NAMES.hovered}.${CLASS_NAMES.csv} > *`,
], {'background-color': '#ffffff40'});

addRule(`.${CLASS_NAMES.inactive}:not(.${CLASS_NAMES.inactive} *)`, {opacity: 0.4});

addRule(`p.${CLASS_MAXIMISED}`, {
	position: 'fixed',
	top: '0',
	left: '0',
	width: '100vw',
	height: '100dvh',
	margin: '0',
	'border-radius': '0',
	'z-index': 2,
	'max-height': 'unset',
});

addRule(`.${CLASS_MAXIMISED} > div`, {
	overflow: 'auto',
	height: '100%',
	'max-height': 'unset',
});

const arrowSize = '0.5ch';

addRule(`.${CLASS_TOOLTIP}`, {
	'font-family': 'consolas, monospace',
	'font-size': '0.85em',
	padding: '3px 1ch',
	'border-radius': '1ch',
	'white-space': 'nowrap',
	position: 'absolute',
	'z-index': '3',
	'background-color': '#343a45',
	outline: '1px solid var(--border-color)',
	'box-shadow': 'white 0px 0px 1px',
	'text-shadow': '0 0 4px #202020',
	'pointer-events': 'none',
});

addRule(`.${CLASS_TOOLTIP}::before`, {
	content: '""',
	position: 'absolute',
	display: 'block',
	width: '0',
	height: '0',
	'border-width': `calc(${arrowSize})`,
	'border-color': 'transparent',
	'border-style': 'solid',
});

addRule([`.${CLASS_TOOLTIP_LEFT}`, `.${CLASS_TOOLTIP_RIGHT}`], {
	transform: 'translateY(-50%)',
});
addRule([`.${CLASS_TOOLTIP_LEFT}::before`, `.${CLASS_TOOLTIP_RIGHT}::before`], {
	top: '50%',
	transform: 'translateY(-50%)',
});
addRule([`.${CLASS_TOOLTIP_BOTTOM}::before`, `.${CLASS_TOOLTIP_TOP}::before`], {
	left: '50%',
	transform: 'translateX(-50%)',
});

addRule(`.${CLASS_TOOLTIP_LEFT}`, {
	translate: `calc(-100% - (${arrowSize})) 0`,
});
addRule(`.${CLASS_TOOLTIP}.${CLASS_TOOLTIP_LEFT}::before`, {
	left: '100%',
	'border-left-color': 'var(--border-color)',
});

addRule(`.${CLASS_TOOLTIP_RIGHT}`, {
	translate: `calc(${arrowSize}) 0`,
});
addRule(`.${CLASS_TOOLTIP}.${CLASS_TOOLTIP_RIGHT}::before`, {
	right: '100%',
	'border-right-color': 'var(--border-color)',
});

addRule(`.${CLASS_TOOLTIP_BOTTOM}`, {
	translate: `-50% calc(${arrowSize})`,
});
addRule(`.${CLASS_TOOLTIP}.${CLASS_TOOLTIP_BOTTOM}::before`, {
	bottom: '100%',
	'border-bottom-color': 'var(--border-color)',
});

addRule(`.${CLASS_TOOLTIP_TOP}`, {
	translate: `-50% calc((${arrowSize}) * -1)`,
	transform: 'translateY(-100%)',
});
addRule(`.${CLASS_TOOLTIP}.${CLASS_TOOLTIP_TOP}::before`, {
	top: '100%',
	'border-top-color': 'var(--border-color)',
});
