import {getIdGetter} from '@css';

import {DEGREES} from '@/shared';

export const CLASS_FLASH_CONTAINER = getIdGetter('flash')('container');

const getId = getIdGetter('text');

export const CLASS_WRAPPER = getId('wrapper');

export const CLASS_CODE = getId('code');

export const CLASS_MATH = getId('math');

export const CLASS_MATH_EQUATION = getId('math', 'equation');
export const CLASS_MATH_ASSERTION = getId('math', 'assertion');

export const CLASS_INSTRUCTION = getId('instruction');

export const CLASS_BUTTON = getId('button');

export const TWEENS_RESET = [
	[{rotation: DEGREES[90], position: 0, zoom: 1}, {duration: 0}],
];

export const CORNERS = {
	TOP_LEFT: {x: -0.5, y: 0.5},
	TOP_RIGHT: {x: 0.5, y: 0.5},
	BOTTOM_LEFT: {x: -0.5, y: -0.5},
	BOTTOM_RIGHT: {x: 0.5, y: -0.5},
};
