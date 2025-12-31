import {SUB_PIXEL_BS} from '@/shared';
import {addRule} from '@/shared/css';

import {
	CLASS_WRAPPER, CLASS_ACTIVE, CLASS_CODE, CLASS_INSTRUCTION,
	CLASS_MATH_WRAPPER, CLASS_MATH_CONTAINER, CLASS_MATH_TITLE, CLASS_MATH_BODY,
	CLASS_MATH_EQUATION, CLASS_MATH_ASSERTION, CLASS_MATH_LOOSE,
} from './consts';

addRule([`.${CLASS_MATH_WRAPPER}`, `.${CLASS_CODE}`], {
	border: '1px solid var(--border-color)',
	'border-radius': '10px',
});

addRule([`.${CLASS_MATH_WRAPPER}`, `.${CLASS_CODE} > *`], {
	overflow: 'auto',
	'overscroll-behavior-x': 'contain',
	'overflow-anchor': 'none',
	'max-height': 'calc(var(--text-height) - 2em - var(--scrollbar-width))',
});

addRule(`.${CLASS_CODE}`, {
	'line-height': 'normal',
	'background-color': '#343a45',
	position: 'relative',
	overflow: 'hidden',
});

addRule(`.${CLASS_MATH_EQUATION} mtd:nth-child(1)`, {'text-align': '-webkit-right'});
addRule(`.${CLASS_MATH_EQUATION} mtd:nth-child(1)`, {'text-align': 'right'});
addRule(`.${CLASS_MATH_EQUATION} mtd:nth-child(3)`, {'text-align': 'left'});

addRule(`.${CLASS_MATH_ASSERTION} mtd:nth-child(1)`, {'text-align': '-webkit-right'});
addRule(`.${CLASS_MATH_ASSERTION} mtd:nth-child(1)`, {'text-align': 'right'});
addRule(`.${CLASS_MATH_ASSERTION} mtd:nth-child(2)`, {'text-align': 'left', 'vertical-align': 'bottom'});
// necessary for vertical alignment since parent has `vertical-align: bottom` rather than `middle`
addRule(`.${CLASS_MATH_ASSERTION} mtd:nth-child(2) > :only-child`, {'margin-bottom': 'calc((1lh - 1cap) / 2)'});

addRule(`.${CLASS_MATH_BODY} div`, {'text-wrap-style': 'balance'});

addRule([`.${CLASS_MATH_BODY}`, `.${CLASS_CODE} code`], {
	padding: '0.7em 1em',
});

addRule(`.${CLASS_CODE} code`, {
	'font-family': 'consolas, monospace',
	'font-size': '0.85em',
	'white-space': 'pre',
	// keeps |x| clickable in Viewport Edge's snap zoom snippet
	'padding-right': '3em',
	display: 'block',
	width: 'fit-content',
});

addRule(`.${CLASS_CODE} br + br + br`, {display: 'none'});

addRule(`.${CLASS_MATH_TITLE} + .${CLASS_MATH_BODY}`, {
	'padding-top': '0',
});

addRule(`.${CLASS_MATH_WRAPPER}`, {
	'text-align': 'center',
	'background-color': '#372d2d',
});

addRule(`.${CLASS_MATH_CONTAINER}`, {
	'min-width': 'fit-content',
	display: 'flex',
	// order manipulation to keep title line fillers from covering prior titles
	'flex-direction': 'column-reverse',
});

addRule(`.${CLASS_MATH_TITLE}:hover`, {
	'background-color': 'rgb(73 65 78)',
});

addRule(`msub.${CLASS_MATH_TITLE}`, {
	'margin-top': 'calc(-0.5ex - 1px)',
});

addRule(`.${CLASS_MATH_CONTAINER} math:last-child`, {
	'min-height': '0.75lh',
});

addRule(`.${CLASS_MATH_CONTAINER} > math`, {
	'font-family': '"cambria math", math',
	'font-size': '0.9em',
	display: 'block',
	width: '100%',
	'min-height': '0.5lh',
});

// fixes <msqrt><msup><mo>|</mo><mn>2</mn></msup></msqrt> being too tall
addRule('msqrt msup mo', {height: 0});

addRule('mtext', {
	width: 'max-content',
	'white-space': 'pre-wrap',
});

addRule(`.${CLASS_MATH_TITLE} *`, {
	'pointer-events': 'none',
});

addRule(`.${CLASS_MATH_TITLE}`, {
	position: 'sticky',
	'border-radius': '10px 0',
	top: '0',
	left: '0',
	cursor: 'pointer',
	'background-color': '#372d2d',
	outline: `${SUB_PIXEL_BS}px solid var(--border-color)`,
	display: 'flex',
	'align-items': 'center',
	'min-height': '1lh',
	width: 'max-content',
	padding: '1px 5px',
	'user-select': 'none',
	'overflow-x': 'clip',
	'max-width': '100%',
	'text-overflow': 'ellipsis',
	color: 'var(--border-color)',
});

addRule([`.${CLASS_WRAPPER} .${CLASS_INSTRUCTION}::before`, `.${CLASS_WRAPPER} .${CLASS_INSTRUCTION}::after`], {
	display: 'block',
	content: '" "',
	'white-space': 'pre',
	height: '0',
});

addRule(`.${CLASS_WRAPPER} .${CLASS_INSTRUCTION}`, {
	'font-weight': 'bold',
	'font-size': '0.9em',
	background: 'rgb(87 78 0)',
	padding: '0 1em',
	'border-radius': '10px',
	'text-shadow': '0 0 3px black',
});

addRule(`.${CLASS_WRAPPER} svg`, {filter: 'drop-shadow(0 0 1px black)'});

addRule(`.${CLASS_WRAPPER}:not(.${CLASS_ACTIVE})`, {
	'pointer-events': 'none',
	height: 'calc(100% + 3em)',
	overflow: 'clip',
	position: 'sticky',
	top: '-3em',
});

addRule(`.${CLASS_WRAPPER}.${CLASS_ACTIVE}`, {
	height: 'fit-content',
	'min-height': '100%',
});

addRule(`.${CLASS_MATH_LOOSE}`, {
	'font-size': '0.9em',
	// todo good? it doesn't really work for the "...½π" text
	position: 'relative',
	top: '0.05em',
});
