import {addRule} from '@/shared/css';

import {CLASS_DIALOGUE_CONTAINER, CLASS_DIALOGUE_BACKGROUND, CLASS_DIALOGUE} from './consts';

addRule(`.${CLASS_DIALOGUE_CONTAINER}`, {
	padding: '0.4em 0.7em',
	'font-style': 'italic',
	'text-align': 'right',
	position: 'relative',
	'text-wrap-style': 'balance',
});

addRule(`.${CLASS_DIALOGUE}`, {
	color: 'black',
	'text-shadow': '0 0 1px #ffff00',
});

const background = '#ccc';

addRule(`.${CLASS_DIALOGUE_BACKGROUND}`, {
	position: 'absolute',
	right: '0',
	top: '0',
	'border-radius': '9px',
	background,
	'box-shadow': 'inset 0 0 3px 1px black',
});

addRule(`.${CLASS_DIALOGUE_BACKGROUND}::before`, {
	content: '""',
	display: 'block',
	position: 'absolute',
	right: '4px',
	top: 'calc(100% - 5px)',
	width: '0',
	height: '0',
	'border-width': '9px',
	'border-color': `${background} ${background} transparent transparent`,
	'border-style': 'solid',
	rotate: '342deg',
	'transform-origin': 'left',
	filter: 'blur(1.1px)',
});
