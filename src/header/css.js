import {addRule} from '@/shared/css';

import {CLASS_BUTTON} from './consts';

addRule(`.${CLASS_BUTTON}[disabled] > *`, {opacity: '0.4'});
