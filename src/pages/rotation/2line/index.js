import {DEGREES, getOverlined, opSpace, xmlns} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import {DOUBLE_LINE as SHARED_FUNCTIONS} from '../code';
import Demo, {getSnappedZoom} from './demo';
import * as mock from '../mock';
import getZoomPoints from './zoomPoints';
import {CLASS_MATH, CLASS_MATH_ASSERTION, CLASS_MATH_EQUATION} from '../../consts';

import pointsImage from './pointsImage';

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const get45Button = (demo, rotation, ratioImage) => getButton(
	`${rotation}°`,
	[({zoomPoints}) => [{zoom: Math.max(zoomPoints[0].z, zoomPoints[3].z), position: 0, rotation: DEGREES[rotation], ratioImage}]],
	{getParam: () => getVarGetter(demo, DEGREES[rotation], demo.ratioViewport / ratioImage)()},
);

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getYIntersect', args: ['viewportSize', 'cornerAngle', 'progressAngle'], type: ['y', 'zoom'], and: [
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '/', and: [
				{op: '-', and: [
					'½imageHeight',
					{op: '*', and: ['½imageWidth', {op: 'tan', and: 'cornerAngle'}]},
				]},
				'imageHeight',
			]},
			{op: '/', and: [
				'viewportSize',
				{op: '*', and: [
					{op: 'cos', and: 'progressAngle'},
					{op: 'abs', and: {
						op: '/', and: ['½imageWidth', {op: 'cos', and: 'cornerAngle'}],
					}},
				]},
			]},
		]}},
	]},
	{op: 'func', id: 'getIntersection', args: ['viewportX', 'viewportY', 'axisY', 'cornerX', 'axisZoom'], type: ['x', 'y', 'zoom'], pair: [1, 0], and: [
		{op: '=', id: 'c', and: {
			op: '*', and: ['cornerX', 'axisY'],
		}},
		{op: '=', id: 'd', and: {
			op: '-', and: [
				{op: '*', and: [{op: '-', and: 'viewportY'}, 'cornerX']},
				{op: '*', and: ['viewportX', {op: '-', and: ['axisY', 0.5]}]},
			],
		}},
		'',
		{op: '=', id: 'intersectX', type: 'x', pair: 'intersectY', and: {
			op: '/', and: [
				{op: '*', and: [{op: '-', and: 'viewportX'}, 'c']},
				'd',
			],
		}},
		{op: '=', id: 'intersectY', type: 'y', pair: 'intersectX', and: {
			op: '/', and: [
				{op: '*', and: [{op: '-', and: 'viewportY'}, 'c']},
				'd',
			],
		}},
		'',
		{op: '=', id: 'progress', and: {
			op: '/', and: ['intersectX', 'cornerX'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			'intersectX',
			'intersectY',
			{op: '/', and: [
				'axisZoom',
				{op: '-', and: [1, 'progress']},
			]},
		]}},
	]},
	{op: 'func', id: 'getCloseIntersection', args: ['targetX', 'targetY', 'backupX', 'backupY', 'axisY', 'axisZoom', 'isLeft'], type: ['x', 'y', 'zoom', 'xvp', 'yvp'], pair: [1, 0,,4, 3], and: [
		{op: '=', id: 'cornerX', type: 'x', and: {
			op: '?', and: ['isLeft', -0.5, 0.5],
		}},
		'',
		{op: 'if', and: [
			{op: '!=', and: [
				{op: '<', and: [
					{op: 'abs', and: {
						op: '/', and: [
							{op: '-', and: [0.5, 'axisY']},
							'cornerX',
						],
					}},
					1,
				]},
				{op: '<', and: [
					{op: 'abs', and: {
						op: '/', and: ['targetY', 'targetX'],
					}},
					1,
				]},
			]},
			{op: 'return', and: {op: 'array', multiline: [1, 2], and: [
				{op: '...', and: {
					op: 'call', id: 'getIntersection', and: ['targetX', 'targetY', 'axisY', 'cornerX', 'axisZoom'],
				}},
				'targetX', 'targetY',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: [1, 2], and: [
			{op: '...', and: {
				op: 'call', id: 'getIntersection', and: ['backupX', 'backupY', 'axisY', 'cornerX', 'axisZoom'],
			}},
			'backupX', 'backupY',
		]}},
	]},
	{op: 'func', id: 'getZoomPoints', type: ['zoom', 'x', 'y', 'zoom', 'xvp', 'yvp', 'zoom', 'x', 'y', 'zoom', 'xvp', 'yvp'], pair: [,2, 1,,5, 4,,8, 7,,11, 10], multilineResult: 2, and: [
		{op: '=', id: ['zoomSide', 'zoomBase'], and: {
			op: 'call', id: 'getStartZooms',
		}},
		'',
		{op: '=', id: ['rightX', 'rightY', 'topX', 'topY'], and: {
			op: 'call', id: 'getViewportPoints', and: ['zoomSide', 'zoomBase'],
		}},
		'',
		{op: '=', id: 'isEvenQuadrant', and: {
			op: '!=', and: [
				{op: '%', and: [
					{op: 'floor', and: {
						op: '/', and: ['rotation', '½π'],
					}},
					2,
				]},
				0,
			],
		}},
		{op: '=', id: 'quadrantAngle', type: 'angle', and: {
			op: 'call', id: 'getQuadrantAngle', and: ['isEvenQuadrant'],
		}},
		'',
		{op: '=', id: ['angleBase', 'angleSide'], and: {
			op: 'call', id: 'getProgressAngles', and: ['quadrantAngle'],
		}},
		'',
		{op: '=', id: ['axisIntersectSideY', 'axisIntersectSideZoom'], and: {
			op: 'call', id: 'getYIntersect', multiline: true, and: [
				'½viewportWidth',
				{op: '+', and: ['quadrantAngle', 'angleSide']},
				'angleSide',
			],
		}},
		{op: '=', id: ['axisIntersectBaseY', 'axisIntersectBaseZoom'], and: {
			op: 'call', id: 'getYIntersect', multiline: true, and: [
				'½viewportHeight',
				{op: '-', and: ['½π', 'quadrantAngle', 'angleBase']},
				'angleBase',
			],
		}},
		'',
		{op: '=', multiline: true, id: ['intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['rightX', 'rightY', 'topX', 'topY', 'axisIntersectSideY', 'axisIntersectSideZoom', 'isEvenQuadrant'],
		}},
		{op: '=', multiline: true, id: ['intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['topX', 'topY', 'rightX', 'rightY', 'axisIntersectBaseY', 'axisIntersectBaseZoom', {op: '!', and: 'isEvenQuadrant'}],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: {op: 'array', multiline: 2, and: [
				'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY',
				'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: 2, and: [
			'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY',
			'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY',
		]}},
	]},
	{op: 'func', id: 'getZoom', args: ['flip0', 'flip1', 'isInverse'], type: 'zoom', and: [
		{op: '=', multiline: 3, id: [
			'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A',
			'zoomB', 'fromX0B', 'fromY0B', 'toX0B', 'toY0B', 'fromX1B', 'fromY1B', 'toX1B', 'toY1B',
			'zoomC', 'fromX0C', 'fromY0C', 'toX0C', 'toY0C', 'fromX1C', 'fromY1C', 'toX1C', 'toY1C',
		], and: {
			op: 'call', id: 'getPairings', and: ['flip0', 'flip1'],
		}},
		'',
		{op: 'return', and: {
			op: '||', multiline: true, and: [
				{op: 'call', id: 'getIntersectZoom', and: ['zoomC', 'fromX0C', 'fromY0C', 'toX0C', 'toY0C', 'fromX1C', 'fromY1C', 'toX1C', 'toY1C', 'isInverse', 1]},
				{op: 'call', id: 'getIntersectZoom', and: [
					'zoomB', 'fromX0B', 'fromY0B', 'toX0B', 'toY0B', 'fromX1B', 'fromY1B', 'toX1B', 'toY1B', 'isInverse', {
						op: '-', and: [
							1,
							{op: '/', and: ['zoomB', 'zoomC']},
						],
					},
				]},
				{op: 'call', id: 'getIntersectZoom', and: [
					'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A', 'isInverse', {
						op: '-', and: [
							1,
							{op: '/', and: ['zoomA', 'zoomB']},
						],
					},
				]},
			],
		}},
	]},
];

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	registerFunctions(demo, functions);
	
	const getDirectVars = getVarGetter(demo, DEGREES[90] - 0.4);
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				tag: 'h1',
				content: 'Doubled Down',
				style: {textAlign: 'center'},
			},
			[
				'New idea! Let\'s move the goalposts!',
				'Can we find a system that handles rotation and succeeds at both pan-limiting ', {tag: 'i', content: 'and'}, ' snap-panning?',
			],
			[
				'The prior system\'s inadequacies stemmed from my approach to origin rails.',
				'Tracing along image axes allowed for efficient code and passable snap-panning, but provided an unsatisfactory pan-limiting experience.',
				'The ideal system would always allow users to see what they want in the shortest pan possible.',
				// todo make this a button
				'For example, to see the rightmost image corner, travel directly ',
				getButton('east', [
					({rotation, ratio, second}) => [{rotation, ratio, zoom: second.z, position: 0}],
					({second}) => [{position: second}, {delay: 0.5}],
					({first}) => [{position: first.end}, {duration: 0}],
				], {getParam: getDirectVars}),
				'.',
				'This can be achieved by swapping image axis for viewport axis-based origin rails.',
			],
			[
				'Again, whichever origin rail direction minimises lock rail length is preferred, but intersects are no longer guaranteed.',
				'Lock rails are unchanged.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'Origin rail start zooms are unchanged.',
				'They travel directly towards viewport edge midpoints.',
				'These locations on viewport edges need to be defined in terms of image coordinates.',
				'A diagram of the problem is given below, followed by its solution.',
			],
			{
				tag: 'div',
				content: pointsImage,
				style: {textAlign: 'center'},
			},
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_ASSERTION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the red and orange lines meet at '},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'A'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the orange and green lines meet at '},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'B'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the green and red lines meet at '},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'C'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the image\'s angle of rotation be '},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'θ'},
							]},
						]},
					]},
				]},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'A'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mn', xmlns, content: '0'},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'mn', xmlns, content: '0'},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '∠'},
								{tag: 'mi', xmlns, content: 'C'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'B'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'θ'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '∠'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'B'},
								{tag: 'mi', xmlns, content: 'C'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '90'},
								{tag: 'mo', xmlns, content: '°'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '|'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'C'},
								{tag: 'mo', xmlns, content: '|'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mtext', xmlns, content: 'viewport height'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mn', xmlns, content: '2'},
									]},
								]},
							]},
							{tag: 'mtext', xmlns, content: 'at start zoom'},
						]},
					]},
				]},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '|'},
								{tag: 'mi', xmlns, content: 'B'},
								{tag: 'mi', xmlns, content: 'C'},
								{tag: 'mo', xmlns, content: '|'},
							]},
							{tag: 'mtext', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0'}, content: 'sin'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'θ'},
									{tag: 'mo', xmlns, content: ')'},
								]},
								{tag: 'mo', xmlns, content: '×'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '|'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'B'},
								{tag: 'mo', xmlns, content: '|'},
							]},
							{tag: 'mtext', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0'}, content: 'cos'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'θ'},
									{tag: 'mo', xmlns, content: ')'},
								]},
								{tag: 'mo', xmlns, content: '×'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
							]},
						]},
					]},
				]},
			]},
			getCode([
				{op: '=', id: [
					'originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0',
					'originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1',
				], and: {
					op: 'call', id: 'getZoomPoints',
				}},
				'',
				{op: '=', id: ['topLeftX', 'topLeftY'], and: {
					op: 'call', id: 'getBound', and: ['originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0', true],
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
					op: 'call', id: 'getBound', and: ['originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1', false],
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
				'There\'s an issue with the way that I\'ve defined origin rails;',
				'for any image aspect ratio other than 1:1, there are windows of rotation values around ',
				get45Button(demo, 45, 0.8),
				', ',
				get45Button(demo, 135, 1.2),
				', ',
				get45Button(demo, 225, 0.5),
				' and ',
				get45Button(demo, 315, 1.5),
				' where preferred axes can\'t be used.',
			],
			[
				'Bounds jump around when rotating into and out of these windows.',
				'Within them, at low zooms, the system forces sub-optimal panning paths while providing insufficiently restrictive pan-limits.',
			],
			[
				'As image aspect ratio gets more extreme, these windows get increasingly wide and the issues get ',
				getButton('increasingly severe', [
					[{position: 0.5}, {duration: 0}],
					[{ratioImage: 2, zoom: 1}],
					[{rotation: DEGREES[90]}, {duration: 2, delay: 0.2}],
					[{rotation: 0}, {ease: 'none', duration: 5}],
				], {getParam: getDirectVars}),
				'.',
			],
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			[
				'On top of this, the region in which the position lies is no longer obvious.',
				'For simplicity, I check every region, further quadrupling checks for a total of 12x complexity.',
			],
			'If there\'s more than one possible snap zoom, the higher value is used.',
			getCode([
				{op: '=', id: 'snapZoom', type: 'zoom', and: {
					op: 'max', multiline: true, and: [
						{op: 'call', id: 'getZoom', and: [false, false, false]},
						{op: 'call', id: 'getZoom', and: [false, true, true]},
						{op: 'call', id: 'getZoom', and: [true, false, true]},
						{op: 'call', id: 'getZoom', and: [true, true, false]},
					],
				}},
			]),
			{
				tag: 'h2',
				content: 'Snap-Pan Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'Despite its pan-limiting flaws, the system\'s a surprisingly good snap-panner!',
				// todo window borders? define
				'The only harm done by the strange pan-limiting behaviour is some slight inconsistency in snap-pan outcomes around window borders.',
			],
			[
				'Even inside of windows, however, outcomes are sensible.',
				'Using the maximum snap zoom possible means that, when rails intersect, the troublesome pre-intersect segments get ignored.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'This system\'s less efficient and even worse at both pan-limiting than the prior.',
				'Not ideal!',
			],
			[
				'Outside of the problem windows, however, it is exactly what I\'m looking for.',
				'The system shows that this approach to origin rails has promise, but it needs an innovation.',
				'Let\'s see if we can find one!',
			],
		),
	);
	
	return demo;
};
