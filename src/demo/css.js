import {addRule} from 'css';

import {CLASS_WRAPPER, CLASS_WRAPPER_IMAGE, CLASS_IMAGE, CLASS_CROSSHAIR} from './consts';

addRule(`.${CLASS_WRAPPER} + *`, {width: 0});

addRule(`.${CLASS_WRAPPER_IMAGE} > *`, {position: 'absolute'});

addRule(`.${CLASS_IMAGE} > *`, {
	'pointer-events': 'none',
	position: 'absolute',
	width: '100%',
	height: '100%',
});

addRule(`.${CLASS_CROSSHAIR}::after`, {content: '"🞣"'});
