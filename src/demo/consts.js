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

// gives rounding error leeway for zoom=1 angle=0 states to ensure 0D bounds
export const PADDING_VIEWPORT = 1;

export const DURATION_CAP_GETTERS = {
	rotation: (to, from) => Math.abs(to - from) / 0.1,
};

DURATION_CAP_GETTERS.x = DURATION_CAP_GETTERS.y = DURATION_CAP_GETTERS.xTarget = DURATION_CAP_GETTERS.yTarget = (to, from) => Math.abs(to - from) / 0.07;
DURATION_CAP_GETTERS.zoom = DURATION_CAP_GETTERS.ratio = DURATION_CAP_GETTERS.ratioImage = (to, from) => ((to > from ? (to / from) : (from / to)) - 1) * 10;
