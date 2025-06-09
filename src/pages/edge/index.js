import {DEGREES} from '@/shared';

import {getText, getCode} from '../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	const getSnapPosition = () => ({
		x: (0.5 - demo.viewportDimensions.width / demo.imageDimensions.width / 4),
		y: (0.5 - demo.viewportDimensions.height / demo.imageDimensions.height / 4),
	});
	
	const snapPan = () => {
		Object.assign(demo.position, getSnapPosition());
		
		demo.zoom = 2;
		demo.rotation = DEGREES[90];
		
		demo.setLimits();
		
		demo.applyPosition();
		demo.applyZoom();
		demo.applyRotation();
	};
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h2',
				content: 'Viewport Edge',
			},
			[
				'To solve this snap panning problem, we need a pan-limiting system that\'s affected by the viewport\'s dimensions.',
				'To keep things simple, let\'s avoid considering rotation for now.',
			],
			[
				'When possible, our new system keeps the viewport wholly within the image.',
				'Panning is prevented along axes where the viewport is ',
				{
					tag: 'button',
					content: 'larger',
					onclick: () => {
						const duration = 1;
						
						demo.doTween(
							false,
							['rotation', DEGREES[90], {duration, ease: 'power4.out'}],
							['zoom', 0.8, {duration: duration, ease: 'power4.out'}],
						);
					},
				},
				' than the image.',
			],
			[
				'Notice that the viewport\'s dimensions half as zoom ',
				{
					tag: 'button',
					content: 'doubles',
					onclick: () => {
						demo.doTween(false, ['zoom', demo.zoom * 2, {duration: 1, ease: 'power1.inOut', yoyo: true, repeat: 1, repeatDelay: 0.5}]);
					},
				},
				'.',
				'This reciprocal relationship between zoom and viewport size gives the following calculation for pan limits along the x & y axes:',
			],
			getCode(
				'if viewportWidth ÷ zoom ⩾ imageWidth:',
				'  x = 0',
				'else:',
				'  paddingX = viewportWidth ÷ zoom ÷ imageWidth ÷ 2',
				'  -0.5 + paddingX ⩽ x ⩽ 0.5 - paddingX',
				'',
				'if viewportHeight ÷ zoom ⩾ imageHeight:',
				'  y = 0',
				'else:',
				'  paddingY = viewportHeight ÷ zoom ÷ imageHeight ÷ 2',
				'  -0.5 + paddingY ⩽ y ⩽ 0.5 - paddingY',
			),
			[
				'Snap panning now requires an accommodating zoom adjustment.',
				'We can derive the calculation by solving the pan limiting calculation for zoom.',
			],
			getCode(
				'zoomX = viewportWidth ÷ imageWidth ÷ 2 ÷ (0.5 - |x|)',
				'zoomY = viewportHeight ÷ imageHeight ÷ 2 ÷ (0.5 - |y|)',
				'',
				'zoom = max(zoomX, zoomY)',
			),
			[
				'So now, zoom is adjusted for us automatically when ',
				{
					tag: 'button',
					content: 'snap panning',
					onpointerover: () => {
						demo.constructor.target.set(getSnapPosition(), demo);
					},
					onpointerout: () => {
						demo.constructor.target.hide();
					},
					onclick: () => {
						snapPan();
						
						demo.constructor.target.hide();
					},
				},
				'.',
				'Position will even be ',
				{
					tag: 'button',
					content: 'corrected',
					onclick: () => {
						demo.setWidth(0.8);
						
						snapPan();
						
						demo.setWidth(1.5, {duration: 1, ease: 'power1.inOut'});
					},
				},
				' if we increase viewport size!',
			],
			[
				'However, since we\'re not considering rotation, our system ',
				{
					tag: 'button',
					content: 'fails',
					onclick: () => {
						demo.position.x = 0;
						demo.position.y = 0;
						demo.zoom = 1;
						demo.rotation = DEGREES[90] - 0.2;
						
						demo.applyRotation();
						
						demo.doTween(
							true,
							['zoom', 2, {duration: 2, ease: 'power3.inOut', yoyo: true, repeat: 1}],
						);
					},
				},
				' when it\'s introduced.',
				'Handling rotation will require a significant jump in complexity...',
			],
		),
	);
};
