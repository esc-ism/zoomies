import {CLASS_SEMANTIC_BUTTON} from '@/consts';
import demo from '@/demo';
import {DEGREES} from '@/shared';
import {xmlns} from '@/pages/shared/math';

import {CLASS_MATH_EQUATION, TWEEN_OPTIONS_YOYO, CLASS_MATH_LOOSE, TWEEN_OPTIONS_SETUP} from '../consts';
import getRefreshButton from '../code/buttons/refresh';
import {register as registerFunctions, cleanup} from '../code';
import {getText, getCode, getInstruction, getMath, getInputDependent, getLink, getDialogue} from '../shared';
import {getButton, clearButton} from '../shared/button';
import {CLASS_BUTTON} from '../shared/button/consts';
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
		getInstruction(
			[
				'Orange text is a link to a previous system.',
				'After using the link, ', getInputDependent((isMouse) => isMouse ? 'click your browser' : 'tap your phone'), '\'s back button to return.',
			],
			['Links to external sites are blue. They will open in new tabs.'],
		),
		[
			'Whereas bounds in ', getPageButton(IDS.CENTER), ' were fixed, from now on they will ',
			getButton('grow and shrink', [
				[{zoom: 1, position: 0}],
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
			(() => {
				const off = {filter: 'brightness(1) drop-shadow(0 0 0px white)'};
				const on = {filter: 'brightness(2.6) drop-shadow(0 0 1px white)'};
				const animation = [
					[off, on, off, on, off],
					{duration: 1200},
				];
				
				return {
					tag: 'button',
					tabIndex: -1,
					content: 'lines',
					classList: [CLASS_BUTTON, CLASS_SEMANTIC_BUTTON],
					onclick() {
						clearButton();
						
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
			content: 'Bound Maths',
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
			'This reciprocal relationship between zoom and viewport size gives the following calculation for bounds:',
		],
		getInstruction(
			[
				'Below is our first "code snippet".',
				'These expose system logic through interactive source code, using playground state as input.',
			],
			[
				'Greyed-out code is unexecuted for the current inputs.',
				getInputDependent((isMouse) => isMouse ?
					'Click a variable in executed code to see its value. Green variables offer visualisations of their values when moused over.' :
					'Tap a variable in executed code to see its value. Green variables will provide visualisations of their values.'),
			],
			[
				'Code snippets run when you turn a page, and don\'t keep up with state changes.',
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
			{tag: 'i', content: 'boundX'}, ' and ', {tag: 'i', content: 'boundY'}, ' are equal for all states with ',
			getButton('shared', [
				[{ratio: 1, zoom: 1, rotation: DEGREES[90]}],
			]),
			' image and viewport aspect ratio.',
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
				[{zoom: 1, position: 0, rotation: DEGREES[90], ratio: 1}],
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
				// todo always use this ease for resets
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
			'Surprisingly, as long as the viewport height and width are equal, this system handles 90° rotations perfectly!',
			'Image aspect ratio doesn\'t matter.',
			'This is because the viewport\'s height and width are equal, so when rotation causes bounds to depend on a different viewport dimension, the size doesn\'t change.',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'Snap-panning now requires an accommodating zoom adjustment... but how can we find the right zoom?',
		],
		[
			'We can derive it from the bounds formula — it just needs some re-arranging.',
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
			'This is the final "snap zoom"',
		],
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
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'So, what do you think? Do you see why zoomful snap-panning is better?',
		],
		getDialogue('not really... what\'s the ', {tag: 'strong', content: 'point'}, ' of snap-panning?'),
		[
			'Ah, I\'m getting ahead of myself.',
			'Snap-panning allows users to quickly focus on some small feature of the image.',
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
			'As mentioned, 90° rotations cause issues for non-square viewports, which manifest as bad snap-zooms.',
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
			'Hopefully you can see its advantages for snap-panning, even if you think its bounding is worse.',
		],
		[
			'It\'s pretty obvious that, without a change in approach, this system\'s snap-panning can\'t be improved for un-rotated images.',
			'So, in the name of progress, we\'ll only be looking at systems built for rotation from now on.',
		],
		[
			'All upcoming systems will be based on this one, taking various approaches to generalising its behaviour.',
			'The next system will be ', {tag: 'i', content: 'especially'}, ' similar...',
		],
	),
};
