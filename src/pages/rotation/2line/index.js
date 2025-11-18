import demo from '@/demo';
import {DEGREES} from '@/shared';
import {xmlns} from '@/pages/shared/math';

import {CLASS_MATH_ASSERTION, CLASS_MATH_EQUATION, TWEEN_OPTIONS_YOYO} from '../../consts';
import {cleanup, register as registerFunctions} from '../../code';
import {getText, getCode, getDiagrammedMath} from '../../shared';
import {getButton, clearButton} from '../../shared/button';
import * as tweens from '../../shared/tween';

import * as mock from '../mock';
import {DOUBLE_LINE as SHARED_FUNCTIONS} from '../code';

import System, {getSnappedZoom} from './demo';
import getZoomPoints from './zoomPoints';
import pointsImage from './pointsImage';

const code = [];

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);
const getSnapTweens = (getRatio) => tweens.getSnapTweens(() => getVarGetter(Math.floor(Math.random() * 4 - 2) * DEGREES[90] - DEGREES[45], getRatio())(), getSnappedZoom);

const get45Button = (rotation, ratioImage) => getButton(
	`${rotation}°`,
	[({zoomPoints}) => [{zoom: Math.max(zoomPoints[0].z, zoomPoints[3].z), position: 0, rotation: DEGREES[rotation], ratioImage}]],
	{getParam: () => getVarGetter(DEGREES[rotation], demo.ratioViewport / ratioImage)()},
);

const functions = [
	...SHARED_FUNCTIONS,
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
	{op: 'func', id: 'getCloseIntersection', args: ['targetX', 'targetY', 'backupX', 'backupY', 'axisY', 'axisZoom', 'isLeftCorner'], type: ['x', 'y', 'zoom', 'xvp', 'yvp'], pair: [1, 0,,4, 3], and: [
		{op: '=', id: 'cornerX', type: 'x', and: {
			op: '?', and: ['isLeftCorner', -0.5, 0.5],
		}},
		'',
		{op: '=', multiline: true, id: ['intersectX', 'intersectY', 'intersectZoom', 'endX', 'endY', 'isRight'], and: {
			op: '?', multiline: true, and: [
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
				{op: 'array', multiline: [1, 2], and: [
					{op: '...', and: {
						op: 'call', id: 'getIntersection', and: ['targetX', 'targetY', 'axisY', 'cornerX', 'axisZoom'],
					}},
					'targetX', 'targetY', true,
				]},
				{op: 'array', multiline: [1, 2], and: [
					{op: '...', and: {
						op: 'call', id: 'getIntersection', and: ['backupX', 'backupY', 'axisY', 'cornerX', 'axisZoom'],
					}},
					'backupX', 'backupY', false,
				]},
			],
		}},
		'',
		{op: '=', id: ['end', 'intersect'], and: {
			op: '?', multiline: true, and: [
				{op: '>', and: [
					{op: 'abs', and: 'endX'},
					{op: 'abs', and: 'endY'},
				]},
				{op: 'array', and: ['intersectX', 'endX']},
				{op: 'array', and: ['intersectY', 'endY']},
			],
		}},
		'',
		{op: 'return', and: {
			op: '?', multiline: true, and: [
				{op: '!=', and: [
					{op: '<', and: ['end', 0]},
					{op: '<', and: ['intersect', 0]},
				]},
				{op: 'array', and: ['intersectX', 'intersectY', 'intersectZoom', {op: '-', and: 'endX'}, {op: '-', and: 'endY'}, 'isRight']},
				{op: 'array', and: ['intersectX', 'intersectY', 'intersectZoom', 'endX', 'endY', 'isRight']},
			],
		}},
	]},
	{op: 'func', id: 'getZoomPoints', type: ['zoom', 'x', 'y', 'zoom', 'xvp', 'yvp', 'zoom', 'x', 'y', 'zoom', 'xvp', 'yvp'], pair: [,2, 1,,5, 4,,8, 7,,11, 10], multilineResult: [6], and: [
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
		{op: '=', id: ['angleSide', 'angleBase'], and: {
			op: 'call', id: 'getProgressAngles', and: ['quadrantAngle'],
		}},
		'',
		{op: '=', id: ['axisIntersectSideZoom', 'axisIntersectSideY'], and: {
			op: 'call', id: 'getYIntersect', multiline: true, and: [
				'½viewportWidth',
				{op: '+', and: ['quadrantAngle', 'angleSide']},
				'angleSide',
			],
		}},
		{op: '=', id: ['axisIntersectBaseZoom', 'axisIntersectBaseY'], and: {
			op: 'call', id: 'getYIntersect', multiline: true, and: [
				'½viewportHeight',
				{op: '-', and: ['½π', 'quadrantAngle', 'angleBase']},
				'angleBase',
			],
		}},
		'',
		{op: '=', multiline: true, id: ['intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY', 'intersectSideIsRight'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['rightX', 'rightY', 'topX', 'topY', 'axisIntersectSideY', 'axisIntersectSideZoom', 'isEvenQuadrant'],
		}},
		{op: '=', multiline: true, id: ['intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY', 'intersectBaseIsTop'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['topX', 'topY', 'rightX', 'rightY', 'axisIntersectBaseY', 'axisIntersectBaseZoom', {op: '!', and: 'isEvenQuadrant'}],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: {op: 'array', multiline: [6], and: [
				'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY',
				'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY',
				{op: '!=', and: ['intersectSideIsRight', 'intersectBaseIsTop']},
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: [6], and: [
			'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY',
			'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY',
			{op: '!=', and: ['intersectSideIsRight', 'intersectBaseIsTop']},
		]}},
	]},
];

let getDirectVars;

export default {
	System,
	start() {
		getDirectVars = getVarGetter(DEGREES[90] - 0.4);
		
		registerFunctions(functions);
		
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
			content: 'Doubled Down',
			style: {textAlign: 'center'},
		},
		[
			'The prior system\'s inadequacies stemmed from my approach to origin rails.',
			'Tracing along image axes allowed for efficient code and passable snap-panning, but provided an unsatisfactory pan-limiting experience.',
			'The ideal system would always allow users to see what they want in the shortest pan possible, since that\'s their natural inclination.',
			'For example, to see the rightmost image corner, travel directly ',
			getButton('right', [
				({rotation, ratio, zoomPoints}) => [{rotation, ratio, zoom: zoomPoints[3].z, position: 0}],
				({zoomPoints}) => [{position: zoomPoints[3]}, {delay: 0.5}],
				({zoomPoints}) => [{position: zoomPoints[2].end}, {duration: 0}],
			], {getParam: () => getDirectVars()}),
			'.',
			'This is achieved by swapping image axis for viewport axis-based origin rails.',
		],
		[
			'Again, whichever origin rail direction minimises lock rail length is preferred, but switching axes has made rail intersections less reliable.',
		],
		'Lock rails are unchanged.',
		{
			tag: 'h2',
			content: 'Pan-Limit Maths',
			style: {textAlign: 'center'},
		},
		[
			'Origin rails retain the same start zooms, but now travel directly towards viewport edge midpoints.',
			'This requires us to find the coordinates of these midpoints.',
			'A solution is given below, using the base image corners and the viewport\'s top edge as an example.',
		],
		getDiagrammedMath(
			pointsImage,
			{
				title: 'Variables',
				content: {tag: 'mtable', xmlns, classList: [CLASS_MATH_ASSERTION], content: [
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'div', content: 'let half of the viewport\'s height at the target start zoom be'},
						]},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'd'},
						]},
					]},
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'div', content: 'let the top viewport edge\'s midpoint be'},
						]},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mo', xmlns, content: '('},
							{tag: 'mi', xmlns, content: 'x'},
							{tag: 'mo', xmlns, content: ', '},
							{tag: 'mi', xmlns, content: 'y'},
							{tag: 'mo', xmlns, content: ')'},
						]},
					]},
				]},
			},
			{
				title: 'Declarations',
				content: {tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'θ'},
						]},
						{tag: 'mtext', xmlns, content: 'is'},
						{tag: 'mtd', xmlns, content: [
							{tag: 'div', content: 'the image\'s angle of rotation'},
						]},
					]},
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
							{tag: 'mo', xmlns, content: '|'},
							{tag: 'mi', xmlns, content: 'A'},
							{tag: 'mi', xmlns, content: 'C'},
							{tag: 'mo', xmlns, content: '|'},
						]},
						{tag: 'mtext', xmlns, content: 'is'},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'd'},
						]},
					]},
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mo', xmlns, content: '|'},
							{tag: 'mi', xmlns, content: 'B'},
							{tag: 'mi', xmlns, content: 'C'},
							{tag: 'mo', xmlns, content: '|'},
						]},
						{tag: 'mtext', xmlns, content: 'is'},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'x'},
						]},
					]},
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mo', xmlns, content: '|'},
							{tag: 'mi', xmlns, content: 'A'},
							{tag: 'mi', xmlns, content: 'B'},
							{tag: 'mo', xmlns, content: '|'},
						]},
						{tag: 'mtext', xmlns, content: 'is'},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'y'},
						]},
					]},
				]},
			},
			{
				title: {tag: 'mi', xmlns, content: 'x'},
				content: {tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mo', xmlns, setAttributes: {rspace: '0'}, content: 'sin'},
							{tag: 'mo', xmlns, content: '('},
							{tag: 'mi', xmlns, content: 'θ'},
							{tag: 'mo', xmlns, content: ')'},
						]},
						{tag: 'mo', xmlns, content: '='},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mfrac', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mfrac', xmlns, content: [
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mi', xmlns, content: 'd'},
							]},
						]},
					]},
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mrow', xmlns, content: [
								{tag: 'mo', xmlns, setAttributes: {rspace: '0'}, content: 'sin'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'θ'},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mo', xmlns, content: '×'},
							{tag: 'mi', xmlns, content: 'd'},
						]},
						{tag: 'mo', xmlns, content: '='},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'x'},
						]},
					]},
				]},
			},
			{
				title: {tag: 'mi', xmlns, content: 'y'},
				content: {tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mo', xmlns, setAttributes: {rspace: '0'}, content: 'cos'},
							{tag: 'mo', xmlns, content: '('},
							{tag: 'mi', xmlns, content: 'θ'},
							{tag: 'mo', xmlns, content: ')'},
						]},
						{tag: 'mo', xmlns, content: '='},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mfrac', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mfrac', xmlns, content: [
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mi', xmlns, content: 'd'},
							]},
						]},
					]},
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mrow', xmlns, content: [
								{tag: 'mo', xmlns, setAttributes: {rspace: '0'}, content: 'cos'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'θ'},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mo', xmlns, content: '×'},
							{tag: 'mi', xmlns, content: 'd'},
						]},
						{tag: 'mo', xmlns, content: '='},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'y'},
						]},
					]},
				]},
			},
		),
		getCode(code, [
			{op: '=', id: [
				'originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0',
				'originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1',
				'match0',
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
			'There\'s an issue with this approach;',
			'for any image aspect ratio other than 1:1, there are windows of rotation values around ',
			get45Button(45, 0.8),
			', ',
			get45Button(135, 0.8),
			', ',
			get45Button(225, 1.25),
			' and ',
			get45Button(315, 1.25),
			' where one origin rail wouldn\'t intersect its lock rail if it used the preferred axis.',
			'The result is crossed lock rails, with bounds that seem to ',
			getButton('invert', [
				({ratioImage, rotation, zoom}) => [{ratioImage, rotation, position: 0, zoom: zoom / 1.1}],
				({zoom}) => [{zoom: zoom * 1.1}, TWEEN_OPTIONS_YOYO],
			], {getParam: () => {
				const data = getVarGetter(DEGREES[135], demo.ratioViewport / 0.5)();
				const zoom = getSnappedZoom(...data.zoomPoints, {x: 0, y: 0});
				
				return {...data, zoom};
			}}),
			' at some point along their path.',
		],
		[
			'Bounds jump around when rotating into and out of these "inversion windows".',
			'Within them, at pre-inversion zooms, the system provides ',
			getButton('insufficiently restrictive', [
				({ratioImage, rotation, zoomPoints}) => [{ratioImage, rotation, position: 0, zoom: zoomPoints[3].z + 0.01}],
				({zoomPoints}) => [{position: zoomPoints[3]}],
			], {getParam: getVarGetter(DEGREES[135], 0.6)}),
			' pan-limits',
		],
		[
			'As image aspect ratio gets more extreme, inversion windows get increasingly wide and the issues get ',
			getButton('increasingly severe', [
				[{position: 0, ratioImage: 2, zoom: 1, rotation: DEGREES[90]}],
				[{rotation: 0}, {ease: 'none', duration: 5}],
			], {getParam: () => getDirectVars()}),
			'.',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'In all prior systems, it was straightforward to rule out pairs of rails that didn\'t need checking.',
			'Here, however, the region in which the position lies is no longer obvious.',
			'Plus, even if a snap zoom is found in one region, the bound inversion behaviour means that another valid zoom may exist in another region.',
			'For simplicity, I check every region.',
		],
		[
			'Although the system\'s efficiency per rail pair is similar to that of the prior,',
			'it ends up running slower since four rail pairs must be checked instead of just one.',
		],
		'If there\'s more than one possible snap zoom, the higher value is used.',
		getCode(code, [
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
			'Even when snap-panning within inversion windows, outcomes are ',
			getButton('sensible', ...getSnapTweens(() => Math.random() / 10 + 0.2)),
			'.',
			'The only clue to their existence is some slight behavioural inconsistency around the rotation values at window limits.',
		],
		[
			'How is the system producing reasonable snap zooms from bad rails?',
			'Well, bound inversion happens at the snap zoom for position (0, 0).',
			'Using the maximum snap zoom possible means that the troublesome pre-inversion rail segments are ignored.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'This system\'s less efficient and even worse at pan-limiting than the prior.',
			'It\'s actually the only system I\'ve discussed that has no justifiable application - even Unbound is useful in ', {tag: 'i', content: 'some'}, ' contexts.',
		],
		{
			content: 'Not ideal!',
			style: {textAlign: 'center'},
		},
		[
			'On the bright side, its behaviour outside of inversion windows is exactly what I\'m looking for.',
			'The system shows that this approach to origin rails has promise, but it needs an innovation.',
			'Let\'s see if we can find one!',
		],
	),
};
