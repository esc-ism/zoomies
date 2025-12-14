import demo from '@/demo';
import {DEGREES} from '@/shared';
import {xmlns} from '@/pages/shared/math';

import {CLASS_MATH_ASSERTION, CLASS_MATH_EQUATION, CLASS_MATH_LOOSE, TWEEN_OPTIONS_YOYO} from '../../consts';
import {cleanup, register as registerFunctions} from '../../code';
import {getText, getCode, getDiagrammedMath, getDialogue, getConnectedPunctuation, getInputDependent} from '../../shared';
import {getButton, clearButton} from '../../shared/button';
import {getPageButton, IDS} from '../../shared/page';
import {getSnapTweens, getSnapOptions} from '../../shared/tween';

import * as mock from '../mock';
import {DOUBLE_LINE as SHARED_FUNCTIONS} from '../code';

import System, {getSnappedZoom} from './demo';
import getZoomPoints from './zoomPoints';
import pointsImage from './pointsImage';
import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/orientation';

const code = [];

const getNearest45 = () => Math.round(demo.rotation / DEGREES[90] + 0.5) * DEGREES[90] - DEGREES[45];

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const boundGetSnapTweens = (getRatio) => getSnapTweens(() => getVarGetter(Math.floor(Math.random() * 4 - 2) * DEGREES[90] - DEGREES[45], getRatio())(), getSnappedZoom);

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
	{op: 'func', id: 'getRails', type: ['zoom', 'x', 'y', 'zoom', 'xvp', 'yvp', 'zoom', 'x', 'y', 'zoom', 'xvp', 'yvp'], pair: [,2, 1,,5, 4,,8, 7,,11, 10], multilineResult: [6], and: [
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
		{op: '=', id: 'θ', and: {
			op: 'call', id: 'getθ', and: ['isEvenQuadrant'],
		}},
		'',
		{op: '=', id: ['αSide', 'αBase'], and: {
			op: 'call', id: 'getα', and: ['θ'],
		}},
		'',
		{op: '=', id: ['axisIntersectSideZoom', 'axisIntersectSideY'], and: {
			op: 'call', id: 'getYIntersect', multiline: true, and: [
				'½viewportWidth',
				{op: '+', and: ['θ', 'αSide']},
				'αSide',
			],
		}},
		{op: '=', id: ['axisIntersectBaseZoom', 'axisIntersectBaseY'], and: {
			op: 'call', id: 'getYIntersect', multiline: true, and: [
				'½viewportHeight',
				{op: '-', and: ['½π', 'θ', 'αBase']},
				'αBase',
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

export default {
	System,
	start() {
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
			getPageButton(IDS.IMAGE), '\'s inadequacies stemmed from my approach to origin rails.',
			'Tracing along image axes allowed for efficient code and passable snap-panning, but provided an unsatisfactory bounding experience.',
			'The ideal system would always allow users to see what they want in the shortest pan possible, since that\'s their natural inclination.',
			(() => {
				const ratioListeners = [];
				let isWide;
				
				demo.hooks.resizeViewport.add(() => {
					isWide = demo.ratioViewport > 1;
					
					for (const listener of ratioListeners) {
						listener();
					}
				}, true);
				
				return {
					tag: 'span',
					content: [
						'For example, to see the ',
						{tag: 'span', callback: (element) => {
							ratioListeners.push(() => element.innerText = isWide ? 'top' : 'right');
						}},
						'most image corner, travel directly ',
						getConnectedPunctuation(getButton('right', [
							({rotation, ratio, second}) => [{rotation, ratio, zoom: second.z, position: 0}],
							({second}) => [{position: second}, {delay: 0.5}],
							({first}) => [{position: first.end}, {duration: 0}],
						], {
							getParam: () => {
								const data = getVarGetter(DEGREES[90] - 0.4, demo.ratioViewport)();
								const [first, second] = data.zoomPoints.slice(isWide ? 0 : 2);
								
								return {...data, first, second};
							},
							callback: (element) => {
								ratioListeners.push(() => element.innerText = isWide ? 'up' : 'right');
							},
						}), '.'),
					],
				};
			})(),
			' This is achieved by swapping image axis for viewport axis-based origin rails.',
		],
		[
			'Again, whichever origin rail direction minimises lock rail length is preferred.',
			'Lock rails are unchanged.',
		],
		{
			tag: 'h2',
			content: 'Bound Maths',
			style: {textAlign: 'center'},
		},
		[
			'Origin rail start zooms are unchanged, but now travel directly towards viewport edge midpoints.',
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
							{tag: 'div', content: 'let the viewport\'s height at the target start zoom be'},
						]},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mn', xmlns, content: '2'},
							{tag: 'mi', xmlns, content: 'v'},
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
							{tag: 'mi', xmlns, content: 'v'},
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
								{tag: 'mi', xmlns, content: 'v'},
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
							{tag: 'mi', xmlns, content: 'v'},
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
								{tag: 'mi', xmlns, content: 'v'},
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
							{tag: 'mi', xmlns, content: 'v'},
						]},
						{tag: 'mo', xmlns, content: '='},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'y'},
						]},
					]},
				]},
			},
		),
		[
			'That calculation is done by ', {tag: 'i', content: 'getViewportPoints'}, ', within ', {tag: 'i', content: 'getRails'}, '.',
			'Otherwise, things aren\'t dissimilar from ', getPageButton(IDS.IMAGE), '\'s code.',
		],
		getCode(code, [
			{op: '=', id: [
				'originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0',
				'originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1',
				'match0',
			], and: {
				op: 'call', id: 'getRails',
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
			content: 'Bound Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'There\'s an issue with this approach;',
			'for any image aspect ratio other than 1:1, there are windows of rotation values around ',
			getConnectedPunctuation(get45Button(45, 0.8), ', '),
			getConnectedPunctuation(get45Button(135, 0.8), ', '),
			get45Button(225, 1.25),
			' and ',
			get45Button(315, 1.25),
			' where neither lock rail has a good intersection with its preferred viewport axis.',
			'The result is crossed rails, with bounds that seem to ',
			getButton('invert', [
				({ratioImage, rotation, zoom}) => [{ratioImage, rotation, position: 0, zoom: zoom / 1.1}],
				({zoom}) => [{zoom: zoom * 1.1}, TWEEN_OPTIONS_YOYO],
			], {getParam: () => {
				const rotation = getNearest45();
				const data = getVarGetter(rotation, demo.ratioViewport / 0.5)();
				const zoom = getSnappedZoom(...data.zoomPoints, {x: 0, y: 0});
				
				return {...data, zoom};
			}}),
			' at some point along their path.',
		],
		[
			'Bounds jump around when rotating into and out of these "inversion windows".',
			'Within them, at pre-inversion zooms, the system provides overly ',
			getButton('permissive', [
				({ratioImage, rotation, zoom}) => [{ratioImage, rotation, position: 0, zoom}],
				({position}) => [{position}],
			], {getParam: () => {
				const rotation = getNearest45();
				const {zoomPoints, ratioImage} = getVarGetter(rotation, demo.ratioViewport / 0.5)();
				const point = zoomPoints[zoomPoints[1].z > zoomPoints[3].z ? 3 : 1];
				
				return {ratioImage, rotation, position: point, zoom: point.z + 0.01};
			}}),
			' bounds',
		],
		[
			'As image aspect ratio gets more extreme, inversion windows grow and the issues get increasingly ',
			getConnectedPunctuation(getButton('severe', [
				[{position: 0.5, ratioImage: 2, zoom: 1, rotation: DEGREES[90]}],
				[{rotation: 0}, {ease: 'none', duration: 5}],
			]), '.'),
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'In all prior systems, it was straightforward to rule out pairs of rails that didn\'t need checking.',
			'Here, however, the region in which the snap point lies is no longer obvious.',
			'Plus, even if a snap zoom is found in one region, the bound inversion behaviour means that another valid zoom may exist in another region.',
			'For simplicity, I check every region.',
		],
		[
			'Although the system\'s efficiency per rail pair is similar to ', getPageButton(IDS.IMAGE), '\'s,',
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
			'Despite its bounding flaws, the system\'s a surprisingly good snap-panner!',
			'Even when snap-panning within inversion windows, outcomes are ',
			getButton('sensible', ...boundGetSnapTweens(() => Math.random() / 10 + 0.2)),
			'.',
			'The only clue to their existence is some slight behavioural inconsistency around the rotation values at window limits.',
		],
		getDialogue('how aren\'t the bad rails causing issues?'),
		[
			'Well, using the maximum snap zoom possible means that the permissive, pre-inversion rail segments are skipped.',
			'Within inversion windows, snap-panning to ',
			getButton(
				{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
					{tag: 'mo', xmlns, content: '('},
					{tag: 'mn', xmlns, content: '0'},
					{tag: 'mo', xmlns, content: ','},
					{tag: 'mn', xmlns, content: '0'},
					{tag: 'mo', xmlns, content: ')'},
				]},
				getSnapOptions(),
				{getParam: () => {
					const position = {x: 0, y: 0};
					
					const rotation = getNearest45();
					const data = getVarGetter(rotation, demo.ratioViewport / 0.5)();
					const zoom = getSnappedZoom(...data.zoomPoints, position);
					
					return {...data, position, zoom, startZoom: 1};
				}},
			),
			' gives the exact snap zoom where inversion happens.',
			'No other snap point can give a lower, pre-inversion zoom.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'This system behaves perfectly when the image is a square — viewport aspect ratio doesn\'t matter.',
			'It\'s a slightly less specific use case than the Single-Line system, but that\'s not saying much.',
		],
		[
			'It\'s less efficient and, for most image aspect ratios, even worse at bounding than ', getPageButton(IDS.IMAGE), '.',
			'Not ideal!',
		],
		[
			'On the bright side, its behaviour outside of inversion windows is exactly what I\'m looking for.',
			'The system shows that this approach to origin rails has promise, but it needs an innovation.',
			'Let\'s see if we can find one!',
		],
	),
};
