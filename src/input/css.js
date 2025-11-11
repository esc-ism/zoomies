import {addRule} from '@/shared/css';

import {CLASS_BUTTON} from './consts';

addRule(`.${CLASS_BUTTON}`, {'background-color': 'unset'});
addRule(`.${CLASS_BUTTON}:not([disabled]):hover`, {'background-color': '#ffffff20'});

addRule(`.${CLASS_BUTTON}[disabled] > *`, {opacity: '0.4'});
