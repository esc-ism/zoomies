import {addRule} from '@css';

import {ID} from './consts';

addRule(`#${ID} td`, {padding: '3px 6px'});

addRule(`#${ID} td:first-child`, {'text-align': 'right', 'padding-right': '0'});

addRule(`#${ID} td:first-child::after`, {content: '":"'});
