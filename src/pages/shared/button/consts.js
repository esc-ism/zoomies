import {DEGREES} from '@/shared';

import {getTextId} from '../../consts';

export const CLASS_BUTTON = getTextId('button');
export const CLASS_BUTTON_ACTIVE = getTextId('button', 'active');

export const TWEENS_RESET = [
	[{rotation: DEGREES[90], position: 0, zoom: 1}, {duration: 0}],
];
