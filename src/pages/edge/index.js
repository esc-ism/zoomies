import {DEGREES} from '@/shared';

import {getText, getCode, getButton} from '../shared';
import {getSnapPosition} from '../center';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h1',
				content: 'Viewport Edge',
				style: {textAlign: 'center'},
			},
			[
				'To solve this snap panning problem, we need a pan-limiting system that\'s affected by the viewport\'s dimensions.',
				'To keep things simple, let\'s avoid considering rotation for now.',
			],
			[
				'When possible, our new system keeps the viewport wholly within the image.',
				'Panning is prevented along axes where the viewport is ',
				getButton('larger', demo, [
					[{rotation: DEGREES[90], zoom: 0.8}],
				]),
				' than the image.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'Notice that the viewport\'s dimensions half as zoom ',
				getButton('doubles', demo, [
					[{position: 0.5}],
					() => [{zoom: demo.zoom * 2}],
				]),
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
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
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
			{
				tag: 'h2',
				content: 'Snap-Pan Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'So now, zoom is adjusted for us automatically when ',
				getButton('snap panning', demo, [
					[{position: 0.5, zoom: 2}, {duration: 0}],
				]),
				'.',
				'Position will even be ',
				getButton('corrected', demo, [
					[{ratio: 1, position: 0.5}, {duration: 0}],
					[{zoom: 1.5}, {position: 0}],
					[{ratio: 2}],
				]),
				' if aspect ratios change!',
			],
			[
				'However, since we\'re not considering rotation, our system ',
				getButton('fails', demo, [
					(position) => [{position}, {duration: 0}],
					[{zoom: 2}],
					[{rotation: DEGREES[90] - 0.2}, {duration: 0.5}],
					({x, y}) => [{position: {x: x - 0.05, y: y - 0.05}}, {ease: 'power1.inOut', duration: 0.2, delay: 0.6}],
					(position) => [{position}, {ease: 'bounce.out', duration: 0.4, delay: 0.1}],
				], {doReset: true, getParam: () => getSnapPosition(demo)}),
				' when it\'s introduced.',
				{
					tag: 'h2',
					content: 'Conclusion',
					style: {textAlign: 'center'},
				},
				'Handling rotation will require a significant jump in complexity...',
			],
		),
	);
	
	return demo;
};
