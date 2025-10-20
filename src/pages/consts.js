import {getId, getIdGetter} from '@/shared/css';

import {DEGREES} from '@/shared';

export const CLASS_FLASH_CONTAINER = getId('flash', 'container');

const getTextId = getIdGetter('text');

export const CLASS_WRAPPER = getTextId('wrapper');

export const CLASS_CODE = getTextId('code');

export const CLASS_MATH = getTextId('math');

export const CLASS_MATH_EQUATION = getTextId('math', 'equation');
export const CLASS_MATH_ASSERTION = getTextId('math', 'assertion');

export const CLASS_INSTRUCTION = getTextId('instruction');

export const CLASS_BUTTON = getTextId('button');
export const CLASS_BUTTON_ACTIVE = getTextId('button', 'active');

export const CLASS_ACTIVE = getTextId('active');

export const TWEENS_RESET = [
	[{rotation: DEGREES[90], position: 0, zoom: 1}, {duration: 0}],
];

export const CORNERS = {
	TOP_LEFT: {x: -0.5, y: 0.5},
	TOP_RIGHT: {x: 0.5, y: 0.5},
	BOTTOM_LEFT: {x: -0.5, y: -0.5},
	BOTTOM_RIGHT: {x: 0.5, y: -0.5},
};
