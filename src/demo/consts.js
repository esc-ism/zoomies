import {getIdGetter} from '@css';

const getId = getIdGetter('demo');

export const CLASS_WRAPPER = getId('wrapper');

export const CLASS_WRAPPER_IMAGE = getId('wrapper', 'image');

export const CLASS_IMAGE = getId('image');

export const CLASS_CROSSHAIR = getId('crosshair');

export const ALLOWANCE_CLICK = 1;

export const MULTIPLIERS_SCROLL = [1, 40, 800];

export const TWEEN_DEFAULT = {
	duration: 1,
	ease: 'power1.inOut',
};
