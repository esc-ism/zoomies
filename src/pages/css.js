import {addRule} from '@/shared/css';

import {
	CLASS_WRAPPER, CLASS_CODE, CLASS_BUTTON, CLASS_INSTRUCTION,
	CLASS_MATH, CLASS_MATH_EQUATION, CLASS_FLASH_CONTAINER,
	CLASS_MATH_ASSERTION,
	CLASS_ACTIVE,
	CLASS_BUTTON_ACTIVE,
} from './consts';

addRule(`.${CLASS_FLASH_CONTAINER}`, {
	overflow: 'hidden',
	'box-sizing': 'border-box',
	position: 'relative',
});

addRule([`.${CLASS_CODE}`, `.${CLASS_MATH}`], {
	'box-shadow': 'white 0 0 2px',
	'border-radius': '10px',
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
addRule(`.${CLASS_MATH_ASSERTION} mtd:nth-child(2)`, {'text-align': 'left'});

addRule(`.${CLASS_CODE} > div`, {'overflow-x': 'auto'});

addRule(`.${CLASS_CODE} code`, {
	'font-family': 'consolas, monospace',
	'font-size': '0.85em',
	'white-space': 'pre',
	
	padding: '10px 1em',
	display: 'block',
	width: 'fit-content',
});

addRule(`.${CLASS_CODE} br + br + br`, {display: 'none'});

addRule(`.${CLASS_MATH}`, {
	'text-align': 'center',
	'background-color': '#372d2d',
});

addRule('mtext', {width: 'max-content'});

addRule(`.${CLASS_MATH} math`, {
	'overflow-x': 'auto',
	'font-family': '"cambria math", math',
	'font-size': '0.9em',
	padding: '0.4em',
	display: 'block',
});

addRule(`.${CLASS_MATH} math + math`, {
	'border-top': '1px solid #868686',
});

const buttonColour = '#eaacfd';

addRule(`.${CLASS_BUTTON_ACTIVE}`, {
	'background-color': buttonColour,
	color: 'black',
});

addRule(`.${CLASS_BUTTON}`, {
	color: buttonColour,
	cursor: 'pointer',
});

addRule(`.${CLASS_BUTTON}:hover`, {
	'text-shadow': 'currentcolor 0 0 1px',
});

addRule(`.${CLASS_BUTTON_ACTIVE}:hover`, {
	'text-shadow': 'currentcolor 0 0 0.5px',
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
	padding: '0 23px',
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
