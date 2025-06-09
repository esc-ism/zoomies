import {addRule} from '@css';

import {CLASS_WRAPPER} from './consts';

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

addRule(`.${CLASS_WRAPPER} button`, {
	background: 'unset',
	border: '1px solid var(--color)',
	color: 'inherit',
	'box-shadow': 'inset 0 0 4px var(--color), 0 0 4px var(--color)',
	'border-radius': '10px',
	font: 'inherit',
	padding: '0 5px 3px',
	cursor: 'pointer',
});
