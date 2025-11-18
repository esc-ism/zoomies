import demo from '@/demo';
import {DEGREES} from '@/shared';

import {xmlns} from '../shared/math';
import {getText, getMath} from '../shared';
import {getButton, clearButton} from '../shared/button';

import System from './demo';
import {inputListener} from '@/consts';

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
			'Only when tasked with facilitating snap-pans is it found lacking.',
		],
		[
			'Say you want to fill your screen with the top-right quadrant of the image —',
			'it\'d be nice if ',
			getButton('snap-panning', [
				[{rotation: DEGREES[90], zoom: 1}],
				() => [{position: getSnapPosition(demo)}, {duration: 0}],
			]),
			' could give you the desired view without having to ',
			getButton('zoom', [
				() => [{rotation: DEGREES[90], position: getSnapPosition(demo), zoom: 1}, {duration: 0}],
				[{zoom: 2}, {delay: 0.2}],
			]),
			' manually.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'The disregard for zoom that helps this system to excel as a pan-limiter makes it unsuited to snap-panning.',
			'It works best paired with a "zoomful" system to cover its weakness.',
			'Zoomful systems have zoom-dependent pan-limits.',
			'All future systems will be zoomful.',
		],
		[
			'If your image can\'t be rotated, this system\'s ideal partner is just one ',
			{tag: 'span', callback: (element) => {
				const update = () => element.innerText = inputListener.isMouse ? 'right arrow key' : 'left swipe';
				
				inputListener.add(update);
			}},
			' away.',
		],
	),
};
