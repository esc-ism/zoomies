import {addRule} from '@/shared/css';

import {CLASS_DIALOGUE, CLASS_DIALOGUE_CONTAINER} from './consts';

addRule(`.${CLASS_DIALOGUE_CONTAINER}`, {
	'font-style': 'italic',
	'text-align': 'right',
	'text-wrap-style': 'balance',
});

addRule(`.${CLASS_DIALOGUE}`, {
	background: 'var(--color)',
	color: 'black',
	padding: '0.3em 0.6em',
	'border-radius': '9px',
	position: 'relative',
	'box-shadow': 'inset 0 0 3px 1px black',
	'text-shadow': '0 0 1px #ffff00',
});

addRule(`.${CLASS_DIALOGUE}::before`, {
	content: '""',
	display: 'block',
	position: 'absolute',
	right: '4px',
	top: 'calc(100% - 5px)',
	width: '0',
	height: '0',
	'border-width': '9px',
	'border-color': 'var(--color) var(--color) transparent transparent',
	'border-style': 'solid',
	rotate: '342deg',
	'transform-origin': 'left',
	filter: 'blur(1.2px)',
});
