import {addRule} from '@/shared/css';
import {addHorizontalRule, addVerticalRule} from '@/shared/orientation';

import {ID_WRAPPER, ID_WRAPPER_IMAGE, ID_RESIZER_HORIZONTAL, ID_RESIZER_VERTICAL} from './consts';

addHorizontalRule(`#${ID_WRAPPER} + *`, {width: 0});
addVerticalRule(`#${ID_WRAPPER} + *`, {height: 0});

addHorizontalRule([`#${ID_WRAPPER}`, `#${ID_WRAPPER_IMAGE}`], {
	width: 'auto',
	height: '100%',
});
addVerticalRule([`#${ID_WRAPPER}`, `#${ID_WRAPPER_IMAGE}`], {
	height: 'auto',
	width: '100%',
});

addHorizontalRule(`#${ID_WRAPPER}`, {
	'padding-right': '1lh',
});

addVerticalRule(`#${ID_WRAPPER}`, {
	'flex-direction': 'column',
	'padding-bottom': '1lh',
});

addHorizontalRule(`#${ID_WRAPPER_IMAGE}`, {
	height: 'auto !important',
});

addVerticalRule(`#${ID_WRAPPER_IMAGE}`, {
	width: 'auto !important',
});

addRule(`#${ID_WRAPPER_IMAGE} > *`, {position: 'absolute'});

addRule([`#${ID_RESIZER_HORIZONTAL}`, `#${ID_RESIZER_VERTICAL}`], {
	'box-sizing': 'border-box',
	position: 'absolute',
	'background-color': 'var(--background)',
	'touch-action': 'none',
});
