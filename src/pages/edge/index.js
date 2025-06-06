import {DEGREES} from '@/shared';

import {getText, getCode} from '../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	const snapPan = () => {
		demo.position.x = (0.5 - demo.viewportDimensions.width / demo.imageDimensions.width / 4);
		demo.position.y = (0.5 - demo.viewportDimensions.height / demo.imageDimensions.height / 4);
		
		demo.zoom = 2;
		demo.rotation = DEGREES[90];
		
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
						demo.zoom = 0.8;
						
						demo.applyZoom();
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
						demo.zoom *= 2;
						
						demo.applyZoom();
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
					onclick: snapPan,
				},
				'!',
				'Position will even be ',
				{
					tag: 'button',
					content: 'corrected',
					onclick: async () => {
						demo.setWidth(0.8);
						
						snapPan();
						
						await new Promise((resolve) => window.setTimeout(resolve, 0));
						
						const observer = new ResizeObserver(() => {
							snapPan();
						});
						
						observer.observe(demo.element);
						
						demo.element.style.transition = 'width 1s ease-in-out';
						demo.setWidth(1.5);
						
						const stop = () => {
							demo.element.style.removeProperty('transition');
							
							observer.disconnect();
							
							demo.element.removeEventListener('transitionend', stop);
							demo.element.removeEventListener('transitioncancel', stop);
						};
						
						demo.element.addEventListener('transitionend', stop);
						demo.element.addEventListener('transitioncancel', stop);
					},
				},
				' if we increase viewport size.',
			],
			[
				'However, since we\'re not considering rotation, our system ',
				{
					tag: 'button',
					content: 'falls apart',
					onclick: () => {
						demo.position.x = 0;
						demo.position.y = 0;
						demo.zoom = 1;
						demo.rotation = 0.2;
						
						demo.applyPosition();
						demo.applyZoom();
						demo.applyRotation();
					},
				},
				' when it\'s introduced.',
				'Handling rotation will require a significant jump in complexity...',
			],
		),
	);
};
