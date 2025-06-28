import {addRule} from '@css';

import {CLASS_WRAPPER, CLASS_CODE, CLASS_BUTTON, CLASS_INSTRUCTION, CLASS_MATH} from './consts';

addRule(`.${CLASS_CODE}`, {
	'line-height': 'normal',
	'background-color': '#3c3448',
	'box-shadow': 'white 0 0 2px',
	'border-radius': '10px',
	position: 'relative',
});

addRule(`.${CLASS_CODE} > div`, {
	'font-size': '1.5em',
	padding: '7px 1em',
	'text-align': 'center',
	'box-shadow': 'white 0 0 2px',
	'background-color': 'rgb(0 0 0 / 10%)',
});

addRule(`.${CLASS_CODE} > code`, {
	'overflow-x': 'auto',
	padding: '10px 1em',
	'font-family': 'consolas, monospace',
	'line-height': 'normal',
	display: 'block',
	'white-space': 'pre',
});

addRule(`.${CLASS_CODE} br + br + br, br:last-child`, {display: 'none'});

addRule(`.${CLASS_WRAPPER} .${CLASS_MATH}`, {
	'text-align': 'center',
	border: '8px double currentcolor',
	'border-radius': '10px',
});

addRule(`.${CLASS_MATH} math`, {
	'overflow-x': 'auto',
	'font-family': '"cambria math", math',
	padding: '0.4em',
	display: 'block',
});

const buttonColour = '#d4acfd';

addRule(`.${CLASS_WRAPPER} .${CLASS_BUTTON}`, {
	color: buttonColour,
	cursor: 'pointer',
});

addRule(`.${CLASS_WRAPPER} .${CLASS_BUTTON}:hover`, {
	// 'text-shadow': '0 0 6px currentcolor',
	'background-color': buttonColour,
	color: 'black',
});

addRule(`.${CLASS_WRAPPER} a`, {color: '#badfdf'});

addRule(`.${CLASS_WRAPPER} .${CLASS_INSTRUCTION}`, {'font-weight': 'bold'});
