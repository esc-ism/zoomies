import demo from '@/demo';
import {DEGREES} from '@/shared';
import {xmlns} from '@/pages/shared/math';
import {CLASS_MATH_WRAPPER} from '../consts';

import {getText, getButton, getMath} from '../shared';

import System from './demo';

// top right corner with zoom=2
export const getSnapPosition = () => ({
	x: 0.5 - demo.sizesViewport.width / demo.sizesImage.width / 4,
	y: 0.5 - demo.sizesViewport.height / demo.sizesImage.height / 4,
});

export default {
	System,
	text: getText(
		{
			tag: 'h1',
			content: 'Viewport Center',
			style: {textAlign: 'center'},
		},
		[
			'Let\'s start ',
			getButton('limiting panning', [
				[{zoom: 1}],
				() => {
					const axis = Math.abs(demo.position.x) >= Math.abs(demo.position.y) ? 'x' : 'y';
					
					return [{[axis]: demo.position[axis] <= 0 ? 0.5 : -0.5}, {ease: 'bounce.out', duration: 1.5}];
				},
			]),
			'!',
			'Here, we have the simplest reasonable system, where the center of the viewport is bound by the image.',
			'The system may be described like:',
		],
		getMath({
			content: {tag: 'mtable', xmlns, content: [
				{tag: 'mtr', xmlns, content: [
					{tag: 'mtd', xmlns, content: [
						{tag: 'mn', xmlns, content: '-0.5'},
						{tag: 'mo', xmlns, content: '⩽'},
						{tag: 'mi', xmlns, content: 'x'},
						{tag: 'mo', xmlns, content: '⩽'},
						{tag: 'mn', xmlns, content: '0.5'},
					]},
				]},
				{tag: 'mtr', xmlns, content: [
					{tag: 'mtd', xmlns, content: [
						{tag: 'mn', xmlns, content: '-0.5'},
						{tag: 'mo', xmlns, content: '⩽'},
						{tag: 'mi', xmlns, content: 'y'},
						{tag: 'mo', xmlns, content: '⩽'},
						{tag: 'mn', xmlns, content: '0.5'},
					]},
				]},
			]},
		}),
		{
			tag: 'h2',
			content: 'Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'Despite its simplicity, this system actually works wonderfully.',
			'Its intuitive, unrestrictive pan-limits provide a frictionless user experience, and the code is hyper-efficient.',
			'In most cases, I think it\'s the best solution.',
			'Its only real issue arises when we consider snap-panning.',
		],
		[
			'Say we want to ',
			getButton('fill', [
				() => [{rotation: DEGREES[90], zoom: 2, position: getSnapPosition(demo)}],
			]),
			' our screens with the top-right quadrant of the image.',
			'We can ',
			getButton('snap-pan', [
				() => [{position: getSnapPosition(demo)}, {duration: 0}],
			]),
			' to the spot we want, but a ',
			getButton('manual zoom', [
				() => [{position: getSnapPosition(demo)}, {duration: 0}],
				[{rotation: DEGREES[90], zoom: 2}, {delay: 0.2}],
			]),
			' is necessary to achieve the desired view.',
			'It\'d be nice if an appropriate zoom could be applied automatically.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'This is a perfect pan-limiting system; it can\'t be improved without also making concessions.',
			'Unfortunately, the disregard for zoom that helps it to excel as a pan-limiter makes it a lousy snap-panner.',
		],
		[
			'I\'ll refer to systems with pan-limits affected by zoom as "zoomful".',
			'All future systems will be zoomful.',
		],
		[
			'A sensible way to apply these systems is to pair this one with an upcoming system, using the other system solely for snap-pans.',
			'If your image can\'t be rotated, its ideal partner is the next system up.',
		],
	),
};
