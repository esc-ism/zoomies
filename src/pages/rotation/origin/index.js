import {DEGREES} from '@/shared';

import {getText, getCode} from '../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h2',
				content: 'Naive Rotation',
			},
			[''],
			{
				content: [
					{
						tag: 'button',
						content: 'bad',
						onclick: () => {
							demo.position.x = 0.5;
							demo.position.y = 0.5;
							demo.zoom = 1;
							demo.rotation = 1.7;
							
							demo.setWidth(0.5);
							
							demo.applyZoom();
							demo.applyRotation();
						},
					},
				],
			},
		),
	);
};
