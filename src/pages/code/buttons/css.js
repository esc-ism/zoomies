import {addRule} from '@/shared/css';

import {CLASS_WRAPPER, CLASS_CONTAINER} from './consts';

addRule(`.${CLASS_WRAPPER}`, {
	position: 'sticky',
	top: '10px',
	left: '100%',
	float: 'right',
	
	'z-index': 1,
	'user-select': 'none',
});

addRule(`.${CLASS_CONTAINER}`, {
	position: 'absolute',
	right: '0',
	display: 'flex',
	'flex-wrap': 'nowrap',
	height: '1lh',
	'margin-right': '10px',
});

addRule(`.${CLASS_CONTAINER} > *`, {
	cursor: 'pointer',
	padding: '0 3px',
});

addRule(`.${CLASS_CONTAINER} > :not(:hover)`, {opacity: 0.4});
