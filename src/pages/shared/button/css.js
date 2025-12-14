import {addRule} from '@/shared/css';

import {CLASS_BUTTON, CLASS_BUTTON_ACTIVE} from './consts';

const buttonColour = '#ec9ae8';

addRule(`.${CLASS_BUTTON_ACTIVE}`, {
	'background-color': buttonColour,
	color: 'black',
});

addRule(`.${CLASS_BUTTON}`, {
	color: buttonColour,
	cursor: 'pointer',
	'text-wrap-mode': 'nowrap',
});
