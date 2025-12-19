import demo from '@/demo';
import {getId, getIdGetter} from '@/shared/css';

export const CLASS_FLASH_CONTAINER = getId('flash', 'container');

export const getTextId = getIdGetter('text');

export const CLASS_WRAPPER = getTextId('wrapper');

export const CLASS_CODE = getTextId('code');

export const CLASS_MATH_LOOSE = getTextId('math', 'loose');

export const CLASS_MATH_WRAPPER = getTextId('math', 'wrapper');
export const CLASS_MATH_CONTAINER = getTextId('math', 'container');
export const CLASS_MATH_TITLE = getTextId('math', 'title');
export const CLASS_MATH_BODY = getTextId('math', 'body');

export const CLASS_MATH_EQUATION = getTextId('math', 'equation');
export const CLASS_MATH_ASSERTION = getTextId('math', 'assertion');

export const CLASS_INSTRUCTION = getTextId('instruction');

export const CLASS_ACTIVE = getTextId('active');

export const CORNERS = {
	TOP_LEFT: {x: -0.5, y: 0.5},
	TOP_RIGHT: {x: 0.5, y: 0.5},
	BOTTOM_LEFT: {x: -0.5, y: -0.5},
	BOTTOM_RIGHT: {x: 0.5, y: -0.5},
};

export const TWEEN_OPTIONS_YOYO = {duration: 0.5, repeat: 3, yoyo: true};
// todo use everywhere for resets
export const TWEEN_OPTIONS_SETUP = {duration: 0.3, ease: 'power1.out'};

export const getTweenOptionsBound = (pointIndex = 1) => ({
	isPositionUpdate: true,
	onUpdate({parent}) {
		const {x, y} = demo.system.bound1 || demo.system.zoomPoints[pointIndex];
		
		if (parent === demo.tween) {
			const {target} = parent.data;
			
			target.x = x;
			target.y = y;
		} else {
			demo.position.x = x;
			demo.position.y = y;
			
			demo.applyPosition();
		}
	},
});
