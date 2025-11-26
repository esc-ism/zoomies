import demo from '@/demo';
import {DEGREES} from '@/shared';
import {xmlns} from '@/pages/shared/math';

import {CLASS_BUTTON, CLASS_MATH_EQUATION, TWEEN_OPTIONS_YOYO, CLASS_MATH_LOOSE} from '../consts';
import getRefreshButton from '../code/buttons/refresh';
import {register as registerFunctions, cleanup} from '../code';
import {getText, getCode, getInstruction, getMath, getInputDependent} from '../shared';
import {getButton, clearButton} from '../shared/button';
import {getSnapPosition} from '../center';

import System from './demo';
import {getSnapOptions} from '../shared/tween';

const refreshButton = getRefreshButton();

refreshButton.style.height = '1em';
refreshButton.style.verticalAlign = 'text-top';

const code = [];

export default {
	System,
	start() {
		// todo rename
		registerFunctions();
		
		for (const {start} of code) {
			start();
		}
	},
	end() {
		cleanup();
		
		for (const {end} of code) {
			end();
		}
		
		clearButton();
	},
	text: getText(
		{
			tag: 'h1',
			content: 'Viewport Edge',
			style: {textAlign: 'center'},
		},
		[
			'This first zoomful system doesn\'t consider rotation.',
			'When possible, it keeps the viewport wholly within the image.',
			'Panning is prevented along axes where the viewport is ',
			getButton('larger', [
				[{rotation: DEGREES[90], zoom: 0.8}],
			]),
			' than the image.',
		],
		[
			'Whereas the prior system had fixed pan-limits, from now on bounds will ',
			getButton('grow and shrink', [
				[{zoom: 1, position: 0}, {duration: 0}],
				[{zoom: 1.25}, TWEEN_OPTIONS_YOYO],
			]),
			' alongside zoom.',
			'Bounds may be a point at the image\'s origin, a ',
			{tag: 'a', content: 'line segment', href: 'https://en.wikipedia.org/wiki/Line_segment'},
			' or a ',
			{tag: 'a', content: 'parallelogram', href: 'https://en.wikipedia.org/wiki/Parallelogram'},
			' (they can be a ',
			{tag: 'a', content: 'rhombus', href: 'https://en.wikipedia.org/wiki/Rhombus'},
			' in upcoming systems, but not this one).',
			'The new playground ',
			(() => {
				const off = {filter: 'brightness(1) drop-shadow(0 0 0px white)'};
				const on = {filter: 'brightness(2.6) drop-shadow(0 0 1px white)'};
				const animation = [
					[off, on, off, on, off],
					{duration: 1200},
				];
				
				return {
					tag: 'span',
					content: 'lines',
					classList: [CLASS_BUTTON],
					tabIndex: 0,
					onclick() {
						for (const line of demo.elements.rail.children) {
							line.animate(...animation);
						}
					},
				};
			})(),
			' plot all possible positions of line segment endpoints and parallelogram corners.',
			'I will refer to them as "rails", since bounds appear to travel along them.',
		],
		{
			tag: 'h2',
			content: 'Pan-Limit Maths',
			style: {textAlign: 'center'},
		},
		[
			'Notice that the viewport\'s dimensions half as zoom ',
			getButton('doubles', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90], position: 0}],
				[{zoom: 2}],
				[{position: 0.25}, {delay: 0.2}],
			]),
			'.',
			'This reciprocal relationship between zoom and viewport size gives the following calculation for pan-limits:',
		],
		getInstruction(
			[
				'Below is our first "code snippet".',
				'These expose internal logic through interactive source code, using playground state as input.',
			],
			[
				'Greyed-out code is unexecuted for the current inputs.',
				getInputDependent((isMouse) => isMouse ?
					'Click a variable in executed code to see its value. Green variables offer visualisations of their values when moused over.' :
					'Tap a variable in executed code to see its value. Green variables will provide visualisations of their values.'),
			],
			[
				'Code snippets run when you turn a page and don\'t keep up with state changes.',
				'Update them via the ', refreshButton, ' button at their top-right corners.',
			],
		),
		getCode(code, [
			{op: '=', id: 'boundX', type: 'x', and: {
				op: '?', multiline: true, and: [
					{op: '>=', and: [
						{op: '/', and: ['viewportWidth', 'zoom']},
						'imageWidth',
					]},
					0,
					{op: '-', and: [0.5, {op: '/', and: ['½viewportWidth', 'zoom', 'imageWidth']}]},
				],
			}},
			'',
			{op: '=', id: 'boundY', type: 'y', and: {
				op: '?', multiline: true, and: [
					{op: '>=', and: [
						{op: '/', and: ['viewportHeight', 'zoom']},
						'imageHeight',
					]},
					0,
					{op: '-', and: [0.5, {op: '/', and: ['½viewportHeight', 'zoom', 'imageHeight']}]},
				],
			}},
		]),
		[
			'When the viewport and image ',
			getButton('share', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90]}],
			]),
			' an aspect ratio,', {tag: 'i', content: 'boundX'}, ' and ', {tag: 'i', content: 'boundY'}, ' are equal for all zooms.',
			'The ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mfrac', xmlns, content: [
					{tag: 'mi', xmlns, content: 'viewportSize'},
					{tag: 'mi', xmlns, content: 'zoom'},
				]},
				{tag: 'mo', xmlns, content: '⩾'},
				{tag: 'mi', xmlns, content: 'imageSize'},
			]},
			' conditions only uncouple when the viewport is ',
			getButton('wider', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90]}],
				[{ratio: 2}, {ease: 'none', duration: 1}],
			]),
			' or ',
			getButton('taller', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90]}],
				[{ratio: 0.5}, {ease: 'none', duration: 1}],
			]),
			' than the image.',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'Snap-panning now requires an accommodating zoom adjustment.',
			'We can derive the formula by solving the pan-limiting calculation for zoom, replacing "boundX" and "boundY" with the target position.',
		],
		getMath(
			{
				title: 'Variables',
				content: {tag: 'mtable', classList: [CLASS_MATH_EQUATION], xmlns, content: [
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mfrac', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mn', xmlns, content: '½'},
									{tag: 'mi', xmlns, content: 'viewportSize'},
								]},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mi', xmlns, content: 'imageSize'},
								]},
							]},
						]},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mo', xmlns, content: '='},
						]},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'r'},
						]},
					]},
				]},
			},
			{
				title: {tag: 'mi', content: 'zoom'},
				content: [
					{tag: 'mtable', classList: [CLASS_MATH_EQUATION], xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '0.5'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'r'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'zoom'},
									]},
								]},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: '|position|'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '0.5'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mi', xmlns, content: '|position|'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'r'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'zoom'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'zoom'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mn', xmlns, content: '0.5'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mi', xmlns, content: '|position|'},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'r'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'zoom'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'r'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mn', xmlns, content: '0.5'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: '|position|'},
									]},
								]},
							]},
						]},
					]},
				],
			},
		),
		getCode(code, [
			{op: '=', id: 'zoomX', type: 'zoom', and: {
				op: '/', and: ['½viewportWidth', 'imageWidth', {op: '-', and: [0.5, {op: 'abs', and: 'x'}]}],
			}},
			{op: '=', id: 'zoomY', type: 'zoom', and: {
				op: '/', and: ['½viewportHeight', 'imageHeight', {op: '-', and: [0.5, {op: 'abs', and: 'y'}]}],
			}},
			'',
			{op: '=', id: 'snapZoom', type: 'zoom', and: {
				op: 'max', and: ['zoomX', 'zoomY'],
			}},
		]),
		{
			tag: 'h2',
			content: 'Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'Zoom is now adjusted automatically when ',
			getButton('snap-panning', getSnapOptions(), {getParam: () => ({
				zoom: demo.system.zoomPoints[1].z * 2,
				position: {x: 0, y: 0, [demo.system.lowAxis === 'y' ? 'x' : 'y']: 0.25},
				startZoom: 1,
				rotation: DEGREES[90],
				ratio: demo.ratio,
			})}),
			'.',
			'Position will even be ',
			getButton('corrected', [
				[{ratio: 1, zoom: 1.5, position: 0.5}],
				[{ratio: 1.5}, {duration: 2.5, ease: 'none'}],
			]),
			' if aspect ratios change!',
		],
		[
			'This is the perfect system for images that can\'t be rotated, but it ',
			getButton('fails', [
				[{zoom: 1, position: 0, rotation: DEGREES[90], ratio: 1}, {duration: 0.3, ease: 'power1.out'}],
				(position) => [position],
				[{zoom: 2}, {position: '<0.3'}],
				[{rotation: DEGREES[90] - 0.2}, {duration: 0.5, delay: 0.3}],
				({x, y}) => [{position: {x: x - 0.05, y: y - 0.05}}, {duration: 0.2, delay: 0.6}],
				(position) => [position, {ease: 'bounce.out', duration: 0.4, delay: 0.1}],
			], {getParam: getSnapPosition}),
			' when rotation is introduced.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'That\'s all for our first zoomful system!',
			'Hopefully you can see its advantages for snap-panning, even if its pan-limiting isn\'t as universally preferable.',
		],
		[
			'From now on, we\'ll only be looking at systems built for rotation.',
			'All upcoming systems will be based on this one, taking various approaches to generalising its behaviour.',
		],
	),
};
