import demo from '@/demo';
import {PADDING_VIEWPORT} from '@/demo/consts';
import {DEGREES} from '@/shared';

import {CLASS_MATH_LOOSE} from '../consts';
import {getText, getMath, getConnectedPunctuation} from '../shared';
import {xmlns} from '../shared/math';
import {getButton, clearButton} from '../shared/button';
import {getSnapOptions} from '../shared/tween';

import System from './demo';

// top right corner with zoom=2
export const getSnapPosition = () => ({
	x: 0.5 - demo.sizesViewport.width / (demo.sizesViewport.width - PADDING_VIEWPORT) / 4,
	y: 0.5 - demo.sizesViewport.height / (demo.sizesViewport.height - PADDING_VIEWPORT) / 4,
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
			getConnectedPunctuation(getButton('bounding', [
				[{zoom: 1}],
				() => {
					const axis = Math.abs(demo.position.x) >= Math.abs(demo.position.y) ? 'x' : 'y';
					
					return [{[axis]: demo.position[axis] <= 0 ? 0.5 : -0.5}, {ease: 'bounce.out', duration: 1.5}];
				},
			]), '!'),
			' Showcased here is the simplest system that actually applies bounds.',
			'It may be described like:',
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
		[
			'Note that coordinates are based on image axes.',
			'Regardless of rotation and aspect ratio, image corners are at ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mo', xmlns, content: '('},
				{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: '±'},
				{tag: 'mn', xmlns, content: '0.5'},
				{tag: 'mo', xmlns, content: ','},
				{tag: 'mo', xmlns, setAttributes: {rspace: '0'}, content: '±'},
				{tag: 'mn', xmlns, content: '0.5'},
				{tag: 'mo', xmlns, content: ')'},
			]},
			'.',
			'This remains constant throughout my work.',
		],
		{
			tag: 'h2',
			content: 'Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			// todo you're unsure about "wonderfully"
			'Despite its simplicity, this system works wonderfully.',
			'Its intuitive, unrestrictive bounds provide a frictionless user experience, and the code is hyper-efficient.',
			'In most cases, I think it\'s the best solution.',
			'Only when tasked with facilitating snap-pans is it found lacking.',
		],
		[
			'Say you want to fill your screen with the top-right quadrant of the image —',
			'it\'d be nice if ',
			getButton('snap-panning', getSnapOptions(false), {getParam: () => ({
				position: getSnapPosition(demo),
				zoom: 1,
				startZoom: 1,
				rotation: DEGREES[90],
				ratio: 1,
			})}),
			' could give you the desired view without having to ',
			getButton('zoom', [
				() => [{rotation: DEGREES[90], zoom: 1, ratio: 1, ...getSnapPosition(demo)}, {duration: 0}],
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
			'The disregard for zoom that helps this system to excel at bounding makes it unsuited to snap-panning.',
			'To cover this weakness, it\'s best paired with a system that has zoom-dependent bounds, aka a "zoomful" system.',
		],
		[
			'All future systems will be zoomful.',
			'For now, the focus will be on snap-panning effectiveness;',
			'systems will be judged on how well they pair with this one.',
		],
	),
};
