import Demo, {getBound, getZoomPoints} from './demo';
import SHARED_FUNCTIONS from '../code';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo, getInstruction} from '../../shared';

import {DEGREES, xmlns} from '@/shared';
import {CLASS_MATH, CLASS_MATH_ASSERTION, CLASS_MATH_EQUATION} from '../../consts';

import * as mock from '../mock';

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

export const restrictiveTweens = {
	ratio: 0.6,
	position: 0.5,
	rotation: -4.467,
	zoom: 2,
};

export const permissiveTweens = {
	rotation: DEGREES[90],
	ratio: 0.6,
	zoom: 1.2,
	position: 0,
};

const opSpace = {tag: 'mspace', style: {width: '0.8em'}, xmlns};
const getOverlined = (content) => ({
	tag: 'mrow', xmlns, style: {textDecoration: 'overline', textDecorationThickness: '1px'}, content: content.split('').map((content) => ({
		tag: 'mi', xmlns, content,
	})),
});

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getBound', args: ['cornerX', 'cornerY', 'cornerZoom'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '<=', and: [
				'zoom',
				'cornerZoom',
			]},
			{op: 'return', and: {op: 'array', and: [0, 0]}},
		]},
		'',
		{op: '=', id: 'progress', and: {
			op: '/', and: [
				'zoom',
				'cornerZoom',
			],
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '-', and: [
				'cornerX',
				{op: '/', and: [
					'cornerX',
					'progress',
				]},
			]},
			{op: '-', and: [
				'cornerY',
				{op: '/', and: [
					'cornerY',
					'progress',
				]},
			]},
		]}},
	]},
	{op: 'func', id: 'getSnippedStart', args: ['cornerX', 'cornerY', 'cornerZoom', 'otherZoom'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '>=', and: ['cornerZoom', 'otherZoom']},
			{op: 'return', and: {op: 'array', and: [0, 0]}},
		]},
		'',
		{op: '=', id: 'proportion', and: {
			op: '-', and: [
				1,
				{op: '/', and: [
					'cornerZoom',
					'otherZoom',
				]},
			],
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '*', and: [
				'proportion',
				'cornerX',
			]},
			{op: '*', and: [
				'proportion',
				'cornerY',
			]},
		]}},
	]},
	{op: 'func', id: 'getCorners', type: ['x', 'y', 'x', 'y'], pair: [1, 0, 3, 2], and: [
		{op: 'if', and: [
			{op: '<=', and: [
				{op: '-', and: 'x'},
				'y',
			]},
			{op: 'if', and: [
				{op: '<=', and: [
					'x',
					'y',
				]},
				{op: 'return', and: {op: 'array', and: [-0.5, 0.5, 0.5, 0.5]}},
			]},
			{op: 'return', and: {op: 'array', and: [0.5, -0.5, 0.5, 0.5]}},
		]},
		{op: 'if', and: [
			{op: '<=', and: [
				'x',
				'y',
			]},
			{op: 'return', and: {op: 'array', and: [-0.5, 0.5, -0.5, -0.5]}},
		]},
		{op: 'return', and: {op: 'array', and: [0.5, -0.5, -0.5, -0.5]}},
	]},
	{op: 'func', id: 'getStartZooms', type: ['zoom', 'zoom'], and: [
		{op: '=', id: ['topLeftX', 'topLeftY', 'topRightX', 'topRightY'], type: ['zoom', 'zoom', 'zoom', 'zoom'], and: {
			op: 'call', id: 'getAllStartZooms',
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: 'min', and: [
				'topLeftX',
				'topLeftY',
			]},
			{op: 'min', and: [
				'topRightX',
				'topRightY',
			]},
		]}},
	]},
];

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	registerFunctions(demo, functions);
	
	const keeper = getVarGetter(demo, -DEGREES['270'] + 0.5, 0.6);
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				tag: 'h1',
				content: 'Single-Line Rotation',
				style: {textAlign: 'center'},
			},
			[
				'Because the last system was so simple, it\'s obvious that there\'s no way to improve its behaviour for un-rotated images.',
				'This won\'t be the case for rotated images;',
				'there are myriad approaches to pan-limiting, some more effective than others, but no clear "perfect" solution.',
				'This is the simplest possible zoomful system that can handle image rotation.',
			],
			[
				'The rail to each image corner is a direct, single line (hence the page\'s title) from the image\'s origin.',
				'Consequently, image corners are ',
				getButton('locked', [
					({zoomPoints, rotation, ratio}) => [{zoom: zoomPoints[1].z, rotation, ratio, position: 0}],
					({zoomPoints}) => [{zoom: zoomPoints[1].z * 1.5}, {
						onUpdate() {
							demo.tweenUpdate.then(() => {
								demo.position = getBound(demo.zoom, zoomPoints[1], false) || demo.position;
								
								demo.applyPosition();
							});
						},
						onStart() {
							demo.tween.data.ignorePosition = true;
						},
						onReverseComplete() {
							demo.position.x = demo.position.y = 0;
							
							demo.applyPosition();
						},
						duration: 2.5, ease: 'none',
					}],
				], {getParam: keeper}),
				' to the position on the viewport\'s rim that they first contact, regardless of zoom.',
				'I\'ll refer to this as the corner\'s "lock point".',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'We\'ll call the zoom at which bounds start progressing along a rail its "start zoom".',
				'To know each rail\'s start zoom, we need to find the maximum zoom at which image corners are visible from the origin.',
				'Adjacent rails can differ, but opposite rails always share a start zoom.',
				'Knowing this, only the top-left and top-right corners need be considered.',
				getInstruction([
					'This code snippet includes custom functions.',
					'Click "getStartZooms" to unfold it and click the "function" text to re-fold.',
					'Note that the "rotation" value\'s unit is ',
					{
						tag: 'a',
						content: 'radians',
						href: 'https://en.wikipedia.org/wiki/Radian',
					},
					' and has a default value of ',
					{
						tag: 'span',
						style: {'white-space': 'nowrap'},
						content: [
							{tag: 'math', xmlns, content: [
								{tag: 'mn', xmlns, content: '½'},
								{tag: 'mi', xmlns, content: 'π'},
							]},
							'.',
						],
					},
				]),
				getCode([
					{op: '=', id: ['topLeftZoom', 'topRightZoom'], and: {
						op: 'call', id: 'getStartZooms',
					}},
				]),
				[
					'Given these zoom values, deriving pan limits is straightforward.',
					'The calculation is demonstrated below.',
				],
			],
			getCode([
				{op: '=', id: ['topLeftX', 'topLeftY'], and: {
					op: 'call', id: 'getBound', and: [-0.5, 0.5, 'topLeftZoom'],
				}},
				'',
				{op: '=', id: 'bottomRightX', ref: 'topLeftX', pair: 'bottomRightY', and: {
					op: '-', and: 'topLeftX',
				}},
				{op: '=', id: 'bottomRightY', ref: 'topLeftY', pair: 'bottomRightX', and: {
					op: '-', and: 'topLeftY',
				}},
				'',
				{op: '=', id: ['topRightX', 'topRightY'], and: {
					op: 'call', id: 'getBound', and: [0.5, 0.5, 'topRightZoom'],
				}},
				'',
				{op: '=', id: 'bottomLeftX', ref: 'topRightX', pair: 'bottomLeftY', and: {
					op: '-', and: 'topRightX',
				}},
				{op: '=', id: 'bottomLeftY', ref: 'topRightY', pair: 'bottomLeftX', and: {
					op: '-', and: 'topRightY',
				}},
			]),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'You\'ll find that this system works ',
				getButton('well', [
					[{ratio: 1, rotation: DEGREES[90], zoom: 1, position: {x: -0.5, y: 0.5}}],
					[{rotation: 0}, {duration: 4}],
					[{zoom: 2}, {duration: 2, ease: 'power3.inOut', yoyo: true, repeat: 1, position: '<'}],
				]),
				' if the viewport and image share an aspect ratio.',
				'The system\'s flaw is only revealed when the ratios are ',
				getButton('decoupled', [[{ratio: restrictiveTweens.ratio}]]),
				'.',
			],
			[
				'Consider ',
				getButton('this', [[{ratio: restrictiveTweens.ratio}], [restrictiveTweens]]),
				' demo state.',
				'Imagine that you want to see the entirety of the image\'s top-right corner.',
				'You\'ll find that it\'s ',
				getButton('impossible', [
					[restrictiveTweens],
					[{position: {x: 0.5, y: 0.1}}, {duration: 2, ease: 'power2.out'}],
				]),
				' to achieve this without ',
				getButton('rotating', [
					[restrictiveTweens],
					[{rotation: Math.round(restrictiveTweens.rotation / DEGREES[90]) * DEGREES[90]}],
				]),
				' or ',
				getButton('zooming', [
					[restrictiveTweens],
					[{zoom: 1}],
				]),
				' out past the point that pan limits become one-dimensional.',
				'This is a problem for any state some rotation and a lock point close to a viewport corner',
			],
			[
				'There, the system was too restrictive, but at other times it isn\'t restrictive enough!',
				'For example, consider ',
				getButton('this', [[permissiveTweens]]),
				' simple, un-rotated state.',
				'Pans along the y axis shouldn\'t be allowed here.',
				'Unfortunately, it\'s impossible to allows pans along only one axis with single-line rails.',
			],
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			'The maths for snap-panning will take a little longer to run through.',
			'For brevity, I\'ll refer to image positions used in snap-panning as "snap points".',
			[
				'Observe how the rails split the image into four segments.',
				'Any snap point will fall into one of these segments, bordered by two rails (any point exactly between two segments may be assigned to either).',
				'If one rail\'s start zoom is lower than the other, we can snip off its start to make them match.',
			],
			getCode([
				{op: '=', id: ['toX0', 'toY0', 'toX1', 'toY1'], and: {
					op: 'call', id: 'getCorners',
				}},
				'',
				{op: '=', id: ['fromX0', 'fromY0'], and: {
					op: 'call', id: 'getSnippedStart', and: [
						'toX0',
						'toY0',
						'topLeftZoom',
						'topRightZoom',
					],
				}},
				{op: '=', id: ['fromX1', 'fromY1'], and: {
					op: 'call', id: 'getSnippedStart', and: [
						'toX1',
						'toY1',
						'topRightZoom',
						'topLeftZoom',
					],
				}},
			]),
			[
				'That\'s the first part of the snap zoom calculation done.',
				'Next, we need to find a ratio "', {tag: 'i', content: 't'}, '" such that a line segment with endpoints ', {tag: 'i', content: 't'}, ' on both rails also passes through the snap point.',
				'When I talk about a point\'s "ratio" on its rail, I mean its distance from the rail\'s start point divided by the rail\'s total length.',
				'It\'s a percentage measurement of how far along the point is, but between 0 and 1 instead of 0 and 100.',
			],
			[
				'A kindred spirit outlines the problem ',
				{
					tag: 'a',
					href: 'https://math.stackexchange.com/questions/2223691/intersect-2-lines-at-the-same-ratio-through-a-point',
					content: 'here',
				},
				', including an excellent diagram that may help you to visualise the problem.',
			],
			[
				'We can write out a definition of rail points at ', {tag: 'i', content: 't'}, ' using the ',
				{
					tag: 'a',
					href: 'https://en.wikipedia.org/wiki/Linear_interpolation',
					content: 'linear interpolation',
				},
				' formula.',
			],
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'point'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 't'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'end'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'point'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 't'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'end'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
					]},
				]},
			]},
			[
				'Now that we can define points at ', {tag: 'i', content: 't'}, ', we can define the line segment that passes through the snap point.',
				'Using the snap point as a separator, we can split it in two.',
				'Knowing that these derived line segments must share a gradient, we can use ',
				{tag: 'span', content: '"m = dY / dX"', style: {whiteSpace: 'nowrap'}},
				' to write the equation we\'re trying to solve.',
			],
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_ASSERTION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the rails be '},
							]},
							{tag: 'mtd', xmlns, content: [
								getOverlined('AB'),
								opSpace,
								{tag: 'mtext', xmlns, content: ' and '},
								opSpace,
								getOverlined('CD'),
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the snap point be '},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mtext', xmlns, style: {whiteSpace: 'pre'}, content: ', '},
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the target line segment be '},
							]},
							{tag: 'mtd', xmlns, content: [
								getOverlined('EF'),
							]},
						]},
					]},
				]},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'E'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 't'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mtd', xmlns, content: opSpace},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'F'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 't'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'E'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 't'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mtd', xmlns, content: opSpace},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'F'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 't'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
					]},
				]},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'E'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'E'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'x'},
									]},
								]},
							]},
							{tag: 'mtd', xmlns, content: {
								tag: 'mo', xmlns, content: '=',
							}},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'F'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'F'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'x'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 't'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'B'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 't'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'B'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
								]},
							]},
							{tag: 'mtd', xmlns, content: {
								tag: 'mo', xmlns, content: '=',
							}},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 't'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 't'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
								]},
							]},
						]},
					]},
				]},
				{tag: 'div', content: '...'},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '0'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msup', xmlns, content: [
									{tag: 'mi', xmlns, content: 't'},
									{tag: 'mn', xmlns, content: '2'},
								]},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '+'},
								opSpace,
								{tag: 'mi', xmlns, content: 't'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mtable', xmlns, content: [
										{tag: 'mtr', xmlns, content: [
											{tag: 'mtd', xmlns, content: [
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'mn', xmlns, content: '2'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
											]},
										]},
										{tag: 'mtr', xmlns, content: [
											{tag: 'mtd', xmlns, content: [
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'mn', xmlns, content: '2'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
											]},
										]},
									]},
								]},
								{tag: 'mo', xmlns, stretchy: 'true', content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '+'},
								opSpace,
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
							]},
						]},
					]},
				]},
			]},
			[
				'We end up with a quadratic expression and solve it with the ',
				{tag: 'a', content: 'quadratic formula', href: 'https://en.wikipedia.org/wiki/Quadratic_formula'},
				' to find ', {tag: 'i', content: 't'}, '.',
				'From here, it\'s a simple calculation using the un-snipped rail\'s start zoom to find our final snap zoom.',
			],
			getCode([
				{op: '=', id: 'ratio', and: {
					op: 'call', id: 'getIntersectRatio', multiline: [4, 4, 1], and: [
						'fromX0', 'fromY0', 'toX0', 'toY0',
						'fromX1', 'fromY1', 'toX1', 'toY1',
						{op: '!=', and: ['toY0', 'toY1']},
					],
				}},
				'',
				{op: '=', id: 'snapZoom', type: 'zoom', and: {
					op: '/', and: [
						{op: 'max', and: ['topLeftZoom', 'topRightZoom']},
						{op: '-', and: [
							1,
							'ratio',
						]},
					],
				}},
			]),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			'Okay! Now that we\'ve gone through how snap-panning works, how useful is it in practise?',
			[
				'Like with pan-limiting, it\'s perfect until we decouple aspect ratios.',
				'Being too restrictive isn\'t as much of an issue here, but being too permissive isn\'t ideal.',
				'Consider ',
				getButton('this', [
					[{ratio: 0.5, rotation: DEGREES[90], position: 0, zoom: 1}],
					[{y: 0.25, zoom: 2}, {duration: 0}],
				]),
				' snap-pan.',
				'Not zooming in enough to hide the empty space above the image doesn\'t make much sense. ',
				getButton('Increasing', [
					[{ratio: 0.25, rotation: DEGREES[90], position: 0}],
					[{y: 0.25, zoom: 2}, {duration: 0}],
				]),
				' the differential makes it even less sensible, with empty space appearing below too.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'Unfortunately, a system with single-line rails doesn\'t produce satisfactory behaviour;',
				'its pan limits can be too restrictive and, when image and viewport don\'t share an aspect ratio, it fails to reproduce the prior system\'s behaviour for un-rotated images.',
			],
		),
	);
	
	return demo;
};
