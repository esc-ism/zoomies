import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	demo.init().then(() => {
		demo.rotation = DEGREES[90] - (33 / 180 * DEGREES[180]);
		demo.constrainRotation();
		demo.applyRotation();
		demo.ratioImage = 1.24;
		demo.ratioViewport = 1.5;
	});
	
	wrapper.append(
		demo.element,
		getText(
			{
				tag: 'h1',
				content: 'Triple-Line Rotation',
				style: {textAlign: 'center'},
			},
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
		),
	);
	
	return demo;
};
