import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	demo.init().then(() => {
		demo.rotation = DEGREES[90] - (35 / 180 * DEGREES[180]);
		demo.constrainRotation();
		demo.applyRotation();
		demo.ratioImage = 1 / 1.6;
	});
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h1',
				content: '3 Line',
			},
			[],
		),
	);
	
	return demo;
};
