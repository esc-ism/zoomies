import {addRule} from '@css';

import {CLASS_WRAPPER, CLASS_WRAPPER_IMAGE, CLASS_CROSSHAIR} from './consts';

addRule(`.${CLASS_WRAPPER} + *`, {width: 0});

addRule(`.${CLASS_WRAPPER_IMAGE} > *`, {position: 'absolute'});

addRule(`.${CLASS_CROSSHAIR}`, {'font-family': 'courier-new, monospace'});
addRule(`.${CLASS_CROSSHAIR}::after`, {content: '"🞣"'});
