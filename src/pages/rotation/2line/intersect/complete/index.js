import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../../../code';
import {getText, getCode, getButton, registerDemo} from '../../../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h1',
				content: 'Intersection',
			},
			[
				'This system has first lines pass through second line intersection points.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Snap-Pan Effectiveness',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'This system fails to reach the heights of the prior\'s, but neither does it reach the same lows.',
				'It\'s nice that bounds now flow smoothly as variables like rotation and aspect ratio are tweened,',
				'but the way that bounds twist around as zoom is increased from the origin zoom isn\'t ideal.',
			],
		),
	);
	
	return demo;
};
