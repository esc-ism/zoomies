import {addRule} from '@css';

import {CLASS_WRAPPER, CLASS_BUTTON, CLASS_INSTRUCTION} from './consts';

addRule(`.${CLASS_WRAPPER} code`, {
	padding: '1em',
	'overflow-x': 'auto',
	'font-family': 'consolas, monospace',
	'line-height': 'normal',
	'background-color': '#2e2e2e',
	'box-shadow': 'white 0 0 2px',
	'border-radius': '10px',
	display: 'block',
	'white-space': 'pre',
});

addRule(`.${CLASS_WRAPPER} .${CLASS_BUTTON}`, {
	color: '#ffa200',
	cursor: 'pointer',
});

addRule(`.${CLASS_WRAPPER} .${CLASS_BUTTON}:hover`, {
	// 'text-shadow': '0 0 6px currentcolor',
	'background-color': '#ffa200',
	color: 'black',
});

addRule(`.${CLASS_WRAPPER} .${CLASS_INSTRUCTION}`, {'font-weight': 'bold'});
