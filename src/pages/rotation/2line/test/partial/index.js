import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../../../code';
import {getText, getCode, getButton, registerDemo} from '../../../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	demo.ratioImage = 2;
	demo.zoom = 0.8;
	demo.applyZoom();
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h1',
				content: 'Image Axis Partial',
			},
			[],
		),
	);
	
	return demo;
};
