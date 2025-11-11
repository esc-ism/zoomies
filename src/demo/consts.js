import {inputListener} from '@/consts';
import {getIdGetter} from '@/shared/css';

const getId = getIdGetter('demo');

export const ID_WRAPPER = getId('wrapper');

export const ID_WRAPPER_IMAGE = getId('wrapper', 'image');

export const ID_IMAGE = getId('image');

export const ID_CROSSHAIR = getId('crosshair');

export const ID_RESIZER_HORIZONTAL = getId('resizer', 'horizontal');
export const ID_RESIZER_VERTICAL = getId('resizer', 'vertical');

export let ALLOWANCE_CLICK;

inputListener.add(() => {
	ALLOWANCE_CLICK = inputListener.isMouse ? 1 : 2;
});

export const MULTIPLIERS_SCROLL = [1, 40, 800];

export const TWEEN_DEFAULT = {
	duration: 1,
	ease: 'power1.inOut',
};

export const PADDING_IMAGE = 2;
