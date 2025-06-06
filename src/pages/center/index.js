import {DEGREES} from '@/shared';

import {getText, getCode} from '../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h2',
				content: 'Viewport Center',
			},
			[
				'Let\'s start limiting panning!',
				'Here, we have the simplest reasonable system, where the center of the viewport is bound by the image.',
				'The system may be described like:',
			],
			getCode(
				'-0.5 ⩽ x ⩽ 0.5',
				'-0.5 ⩽ y ⩽ 0.5',
			),
			[
				'Despite its simplicity, this system actually works wonderfully.',
				'In most cases, I think it\'s the best solution.',
				'The user can always intuit pan limits, every part of the image is viewable and the code is hyper-efficient.',
				'The only real issue with this system is with snap panning.',
			],
			[
				'Say we want to fill our screens with the top-right quadrant of the image, ',
				{
					tag: 'button',
					content: 'like this',
					onclick: () => {
						demo.position.x = 0.5 - demo.viewportDimensions.width / demo.imageDimensions.width / 4;
						demo.position.y = 0.5 - demo.viewportDimensions.height / demo.imageDimensions.height / 4;
						demo.zoom = 2;
						demo.rotation = DEGREES[90];
						
						demo.applyPosition();
						demo.applyZoom();
						demo.applyRotation();
					},
				},
				'.',
				'We can snap pan to the spot we want, but then we have to manually zoom to achieve the desired effect.',
				'It\'d be nice if an appropriate zoom could be applied automatically.',
			],
		),
	);
};
