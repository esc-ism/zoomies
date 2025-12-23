import demo from '@/demo';
import {DEGREES} from '@/shared';
import {xmlns} from '@/pages/shared/math';

import {CLASS_MATH_EQUATION, TWEEN_OPTIONS_YOYO, CLASS_MATH_LOOSE, TWEEN_OPTIONS_SETUP} from '../consts';
import getRefreshButton from '../code/buttons/refresh';
import {register as registerFunctions, cleanup} from '../code';
import {getText, getCode, getInstruction, getMath, getInputDependent, getLink, getDialogue, getConnectedPunctuation} from '../shared';
import {getButton, clearButton} from '../shared/button';
import {getSnapOptions} from '../shared/tween';
import {getPageButton, IDS} from '../shared/page';
import {getSnapPosition} from '../center';

import System from './demo';

const refreshButton = getRefreshButton();

refreshButton.style.height = '1em';
refreshButton.style.verticalAlign = 'text-top';

const code = [];

export default {
	System,
	start() {
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
			content: IDS.EDGE,
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
		getInstruction(
			[
				'Orange text is a link to a previous system.',
				'After using the link, ', getInputDependent((isMouse) => isMouse ? 'click your browser' : 'tap your device'), '\'s back button to return.',
			],
			['Links to external sites are blue. They will open in new tabs.'],
		),
		[
			'Whereas bounds in ', getPageButton(IDS.CENTER), ' were fixed, from now on they will ',
			getButton('grow and shrink', [
				[{zoom: 1, position: 0}, TWEEN_OPTIONS_SETUP],
				[{zoom: 1.25}, TWEEN_OPTIONS_YOYO],
			]),
			' alongside zoom.',
			'Bounds may be a point at the image\'s origin, a ',
			getLink('line segment', 'https://en.wikipedia.org/wiki/Line_segment'),
			', or a ',
			getLink('parallelogram', 'https://en.wikipedia.org/wiki/Parallelogram'),
			' (',
			getLink('rhombuses', 'https://en.wikipedia.org/wiki/Rhombus'),
			' are possible in upcoming systems, but not this one).',
			'The new playground ',
			getButton('lines', [
				[{zoom: 1, position: 0}, {...TWEEN_OPTIONS_SETUP, onComplete: () => {
					const off = {filter: 'brightness(1) drop-shadow(0 0 0px white)'};
					const on = {filter: 'brightness(2.6) drop-shadow(0 0 1px white)'};
					const animation = [
						[off, on, off, on, off],
						{duration: 1200},
					];
					
					for (const line of demo.elements.rail.children) {
						line.animate(...animation);
					}
				}}],
			]),
			' plot all possible positions of line segment endpoints and parallelogram corners.',
			'I will refer to them as "rails", since bounds appear to travel along them.',
		],
		{
			tag: 'h2',
			content: 'Bound Maths',
			style: {textAlign: 'center'},
		},
		[
			'Notice that the viewport\'s dimensions halve as zoom ',
			getConnectedPunctuation(getButton('doubles', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90], position: 0}, TWEEN_OPTIONS_SETUP],
				[{zoom: 2}],
				[{position: 0.25}, {delay: 0.2}],
			]), '.'),
			' This reciprocal relationship between zoom and viewport size gives the following calculation for bounds:',
		],
		getInstruction(
			[
				'Below is our first "code snippet".',
				'These expose system logic through interactive source code, using playground state as input.',
			],
			[
				'Greyed-out code is unexecuted for the current inputs.',
				getInputDependent((isMouse) => isMouse ?
					'Click a variable in executed code to see its value, or double click for a description. Mouse over a green variable to see its value visualised in the playground.' :
					'Tap a variable in executed code to see its value, or double tap for a description. If the variable is green, its value will be visualised in the playground.'),
			],
			[
				'Code snippets run when you turn a page, and don\'t keep up with state changes.',
				'Update them via the ', refreshButton, ' button at their top-right corners.',
			],
		),
		getCode(code, [
			{op: '=', id: 'boundX', description: 'Horizontal panning space as a fraction of image width', type: 'x', and: {
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
			{op: '=', id: 'boundY', description: 'Vertical panning space as a fraction of image height', type: 'y', and: {
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
			{tag: 'i', content: 'boundX'}, ' and ', {tag: 'i', content: 'boundY'},
			' are equal for all states where image and viewport ',
			getButton('share', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90]}],
			]),
			' an aspect ratio.',
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
				[{ratio: 1, zoom: 1, rotation: DEGREES[90]}, TWEEN_OPTIONS_SETUP],
				[{ratio: 2}, {ease: 'none', duration: 1}],
			]),
			' or ',
			getButton('taller', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90]}, TWEEN_OPTIONS_SETUP],
				[{ratio: 0.5}, {ease: 'none', duration: 1}],
			]),
			' than the image.',
		],
		{
			tag: 'h2',
			content: 'Bound Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'Although it isn\'t the focus, this approach to bounding has some possible advantages over ', getPageButton(IDS.CENTER), '.',
			'For example, the user\'s position will be ',
			getButton('corrected', [
				[{ratio: 1, zoom: 1.5, position: 0.5}],
				[{ratio: 1.5}, {duration: 2.5, ease: 'none'}],
			]),
			' if aspect ratios change, and they\'re protected from ',
			getButton('overshooting', [
				() => [{...demo.zoom >= 1 ? {} : {zoom: 1}, position: 0, rotation: DEGREES[90], ratio: 1}, TWEEN_OPTIONS_SETUP],
				[{zoom: 2}, {position: '<30%'}],
				() => [{position: 0.25}, {ease: 'bounce.out', duration: 1, delay: 0.1}],
			]),
			' a perfect corner view.',
		],
		[
			'I call these ', {tag: 'i', content: 'possible'}, ' advantages because they aren\'t necessarily desireable.',
			'In general, the more freedom given to users, the better their experience;',
			'being restricted is frustrating.',
		],
		[
			'Still, if you want zoom-dependent bounds for whatever reason, this system\'s perfect.',
			'Though, of course, it ',
			getButton('fails', [
				[{zoom: 1, position: 0, rotation: DEGREES[90], ratio: 1}, TWEEN_OPTIONS_SETUP],
				(position) => [position],
				[{zoom: 2}, {position: '<30%'}],
				[{rotation: DEGREES[90] - 0.2}, {duration: 0.5, delay: 0.3}],
				({x, y}) => [{position: {x: x - 0.05, y: y - 0.05}}, {duration: 0.2, delay: 0.6}],
				(position) => [position, {ease: 'bounce.out', duration: 0.4, delay: 0.1}],
			], {getParam: getSnapPosition}),
			' when rotation is introduced.',
			'At least, it fails ', {tag: 'i', content: 'most'}, ' of the time...',
		],
		[
			'In a system made for images rotated 90°,',
			' the viewport\'s height would be used to calculate ', {tag: 'i', content: 'boundX'},
			' and its width would be used for ', {tag: 'i', content: 'boundY'}, '.',
			'That\'s the opposite of what we\'re doing here.',
			'If width and height are equal, however, both systems yield the same results.',
			'So, if this system has a square-shaped viewport, it handles 90° rotations perfectly!',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'Snap-panning now requires an accommodating zoom adjustment.',
			'An appropriate zoom can be derived from the bounds formula — it just needs some re-arranging.',
			'By replacing ', {tag: 'i', content: 'boundX'}, ' and ', {tag: 'i', content: 'boundY'}, ' with a point\'s coordinates and solving for zoom,',
			'we get the minimum zoom for which the point is in-bounds.',
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
		[
			'This gives one zoom for the point\'s x-coordinate and another for its y-coordinate.',
			'The position will only be in-bounds at the larger of the two zooms.',
			'This is the final "snap zoom".',
		],
		getCode(code, [
			{op: '=', id: 'zoomX', description: 'The lowest zoom at which x is in-bounds', type: 'zoom', and: {
				op: '/', and: ['½viewportWidth', 'imageWidth', {op: '-', and: [0.5, {op: 'abs', and: 'x'}]}],
			}},
			{op: '=', id: 'zoomY', description: 'The lowest zoom at which y is in-bounds', type: 'zoom', and: {
				op: '/', and: ['½viewportHeight', 'imageHeight', {op: '-', and: [0.5, {op: 'abs', and: 'y'}]}],
			}},
			'',
			{op: '=', id: 'snapZoom', description: 'The lowest zoom at which (x, y) is in-bounds', type: 'zoom', and: {
				op: 'max', and: ['zoomX', 'zoomY'],
			}},
		]),
		{
			tag: 'h2',
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'So, what do you think? Do you see why zoomful snap-panning is better?',
		],
		getDialogue('not really... what\'s the ', {tag: 'strong', content: 'point'}, ' of snap-panning?'),
		[
			'For me, snap-panning is for focusing on some feature of the image —',
			'something small enough that you need to zoom in to see it clearly.',
			'Arguably, this is the main purpose of zooming and panning in general.',
			'The advantage of snap-panning is that, by combining those operations into a single click, it allows users to achieve their desired view faster.',
		],
		[
			'In my implementations, the snap zoom is the minimum zoom for which a point is in-bounds, making it an underestimation of how far the user wants to zoom in.',
			'Because of this, the worst outcome for a snap-pan is being too zoomed out.',
		],
		[
			'This system can\'t be accused of low snap zooms for un-rotated images;',
			'if snap zooms were any higher, the image\'s edge wouldn\'t be visible when ',
			getButton('snap-panning', getSnapOptions(), {getParam: () => ({
				zoom: demo.system.zoomPoints[1].z * 2,
				position: {x: 0, y: 0, [demo.system.lowAxis === 'y' ? 'x' : 'y']: 0.25},
				startZoom: 1,
				rotation: DEGREES[90],
				ratio: demo.ratio,
			})}),
			' to a side.',
		],
		[
			'As mentioned, 90° rotations cause issues for non-square viewports, which manifest as bad snap zooms.',
			{tag: 'i', content: 'With'}, ' square viewports, however, rotation doesn\'t really cause any issues!',
			'It\'s true that, when rotation isn\'t a multiple of 90°, snap zooms will always be ',
			getButton('too high', getSnapOptions(), {getParam: () => ({
				zoom: demo.system.zoomPoints[1].z * 2,
				position: {x: 0.25, y: 0.25},
				startZoom: 1,
				rotation: DEGREES[45],
				ratio: demo.ratio,
			})}),
			' to see image corners, but that overestimation mitigates the fundamental underestimation.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'That\'s all for our first zoomful system!',
			'Hopefully you can see its advantages for snap-panning, even if you find its bounding worse.',
		],
		[
			'This system, made to handle un-rotated images, fulfills its role perfectly.',
			'Every design problem had a single, unambiguous solution, leaving no scope for innovation.',
			'So, in the name of progress, we\'ll only be looking at systems built for rotation from now on.',
		],
		[
			'All upcoming systems will be based on this one, each trying to generalise its behaviour.',
			'Before we start toiling away at grand designs, let\'s see if the lazy option works!',
		],
	),
};
