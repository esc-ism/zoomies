import {getIdGetter} from '@css';

import {DEGREES} from '@/shared';

const getId = getIdGetter('text');

export const CLASS_WRAPPER = getId('wrapper');

export const CLASS_INSTRUCTION = getId('instruction');

export const CLASS_BUTTON = getId('button');

export const TWEENS_RESET = [
	['rotation', DEGREES[90], {duration: 0}],
	['position', 0, {duration: 0}],
	['zoom', 1, {duration: 0}],
];
