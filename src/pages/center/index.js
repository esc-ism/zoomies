import demo from '@/demo';
import {DEGREES} from '@/shared';

import {xmlns} from '../shared/math';
import {getText, getMath} from '../shared';
import {getButton, clearButton} from '../shared/button';

import System from './demo';

// top right corner with zoom=2
export const getSnapPosition = () => ({
	x: 0.5 - demo.sizesViewport.width / demo.sizesImage.width / 4,
	y: 0.5 - demo.sizesViewport.height / demo.sizesImage.height / 4,
});

export default {
	System,
	end: () => {
		clearButton();
	},
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
			// todo you're unsure about "wonderfully"
			'Despite its simplicity, this system works wonderfully.',
			'Its intuitive, unrestrictive pan-limits provide a frictionless user experience, and the code is hyper-efficient.',
			'In most cases, I think it\'s the best solution.',
			'Its only deficiency arises when we consider snap-panning.',
		],
		[
			'Say you want to fill your screen with the top-right quadrant of the image —',
			'it\'d be nice if ',
			getButton('snap-panning', [
				() => [{position: getSnapPosition(demo), zoom: 1}, {duration: 0}],
			]),
			' could give you the desired view without having to ',
			getButton('zoom', [
				() => [{position: getSnapPosition(demo), zoom: 1}, {duration: 0}],
				[{rotation: DEGREES[90], zoom: 2}, {delay: 0.2}],
			]),
			' manually.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'This is a perfect pan-limiting system; it can\'t be improved without also making concessions.',
			'Unfortunately, the disregard for zoom that helps it to excel as a pan-limiter makes it unsuited to snap-panning.',
		],
		[
			'I\'ll refer to systems with pan-limits affected by zoom as "zoomful".',
			'All future systems will be zoomful.',
		],
		[
			'A sensible way to apply these systems is to pair this one with a zoomful system, using the other system solely for snap-pans.',
			'If your image can\'t be rotated, its ideal partner is the next system up.',
		],
	),
};
