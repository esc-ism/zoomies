import {addRule} from '@/shared/css';

import {CLASS_FLASH_CONTAINER} from './consts';

addRule(`.${CLASS_FLASH_CONTAINER}`, {
	overflow: 'hidden',
	'box-sizing': 'border-box',
	position: 'relative',
});
