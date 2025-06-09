import {DEGREES} from '@/shared';

import {getText, getCode, getButton} from '../shared';

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
				'Let\'s start ',
				getButton(
					'limiting panning', demo,
					['zoom', 1],
					['x', 0.5, {ease: 'bounce.out', delay: '>', duration: 1.5}],
				),
				'!',
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
				'Say we want to ',
				getButton(
					'fill our screens with the top-right quadrant',
					demo,
					['rotation', DEGREES[90]],
					['zoom', 2],
					['rotation', DEGREES[90]],
					() => ['x', 0.5 - demo.viewportDimensions.width / demo.imageDimensions.width / 4],
					() => ['y', 0.5 - demo.viewportDimensions.height / demo.imageDimensions.height / 4],
				),
				' of the image.',
				'We can ',
				getButton(
					'snap pan to the spot we want, but a manual zoom',
					demo,
					['rotation', DEGREES[90]],
					() => [
						'position',
						{
							x: 0.5 - demo.viewportDimensions.width / demo.imageDimensions.width / 4,
							y: 0.5 - demo.viewportDimensions.height / demo.imageDimensions.height / 4,
						},
					],
					['zoom', 2, {delay: '>+=0.5'}],
				),
				' is necessary to achieve the desired view.',
				'It\'d be nice if an appropriate zoom could be applied automatically.',
			],
		),
	);
};
