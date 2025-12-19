import {addRule} from '@/shared/css';
import {addHorizontalRule, addVerticalRule} from '@/shared/orientation';

import {ID_WRAPPER, ID_WRAPPER_IMAGE, ID_RESIZER_HORIZONTAL, ID_RESIZER_VERTICAL} from './consts';

addHorizontalRule(`#${ID_WRAPPER} + *`, {width: 0});
addVerticalRule(`#${ID_WRAPPER} + *`, {height: 0});

addHorizontalRule(`#${ID_WRAPPER}`, {
	'padding-right': '1lh',
});

addVerticalRule(`#${ID_WRAPPER}`, {
	'flex-direction': 'column',
	'padding-bottom': '1lh',
});

addRule(`#${ID_WRAPPER_IMAGE}`, {border: '1px solid transparent'});

addHorizontalRule(`#${ID_WRAPPER_IMAGE}`, {'border-right-color': 'currentcolor'});
addVerticalRule(`#${ID_WRAPPER_IMAGE}`, {'border-bottom-color': 'currentcolor'});

addRule([`#${ID_RESIZER_HORIZONTAL}`, `#${ID_RESIZER_VERTICAL}`], {
	'box-sizing': 'border-box',
	position: 'absolute',
	'touch-action': 'none',
});
