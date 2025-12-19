import demo from '@/demo';
import {DEGREES} from '@/shared';

import {cleanup, register as registerFunctions} from '../../code';
import {CLASS_MATH_ASSERTION, CLASS_MATH_EQUATION, CLASS_MATH_LOOSE, getTweenOptionsBound, TWEEN_OPTIONS_SETUP} from '../../consts';
import {getText, getCode, getDiagrammedMath, getInstruction, getConnectedPunctuation} from '../../shared';
import {getPageButton, IDS} from '../../shared/page';
import {getButton, clearButton} from '../../shared/button';
import {xmlns} from '../../shared/math';
import {singleCornerGetter, getSnapTweens} from '../../shared/tween';

import * as mock from '../mock';
import {permissiveTweens, getRestrictiveVars} from '../1line';
import {DOUBLE_LINE as SHARED_FUNCTIONS} from '../code';
import {getAllStartZooms} from '../demo';
import {getPoints, getQuadrantAngle, getZoomProgressed} from '../shared';

import zoomImage from './zoomImage';
import snapImageTrio from './snapImage/triple';
import snapImageDuo from './snapImage/double';
import System, {getSnappedZoom} from './demo';
import getZoomPoints from './zoomPoints';
import {getDoubleImage} from '../shared/doubleImage';

const code = [];

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const boundGetSnapTweens = (getRatio) => getSnapTweens(() => getVarGetter((Math.random() > 0.5 ? -DEGREES[270] : 0) + Math.random() * DEGREES[90], getRatio())(), getSnappedZoom);

const getCornerProgressTweens = (rotation, position = '>-40%') => [
	() => [{position: 0.5, ratio: demo.ratioViewport, zoom: demo.ratioViewport < 1 ? (1 / demo.ratioViewport) : demo.ratioViewport}],
	[{rotation}, {position}],
];

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getIntersectSide', args: ['cornerAngle', 'α', 'θ', 'isEvenQuadrant'], type: ['zoom', 'x', 'y'], pair: [, 2, 1], and: [
		{op: '=', id: 'lockAngle', type: 'angle', and: {
			op: '+', and: ['α', 'θ'],
		}},
		'',
		{op: 'if', and: [
			{op: '<', and: ['lockAngle', 'cornerAngle']},
			{op: '=', id: ['intersectZoom', 'intersectY'], and: {
				op: 'call', id: 'getYIntersect', and: ['½viewportWidth', 'lockAngle', 'α'],
			}},
			'',
			{op: 'return', and: {op: 'array', and: ['intersectZoom', 0, 'intersectY']}},
		]},
		'',
		{op: '=', id: ['intersectZoom', 'intersectX'], and: {
			op: 'call', id: 'getXIntersect', and: ['½viewportWidth', {op: '-', and: ['½π', 'θ', 'α']}, 'α'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			'intersectZoom',
			{op: '?', and: ['isEvenQuadrant', {op: '-', and: 'intersectX'}, 'intersectX']},
			0,
		]}},
	]},
	{op: 'func', id: 'getIntersectBase', args: ['cornerAngle', 'α', 'θ', 'isEvenQuadrant'], type: ['zoom', 'x', 'y'], pair: [, 2, 1], and: [
		{op: '=', id: 'lockAngle', type: 'angle', and: {
			op: '-', and: ['½π', 'θ', 'α'],
		}},
		'',
		{op: 'if', and: [
			{op: '<', and: ['lockAngle', 'cornerAngle']},
			{op: '=', id: ['intersectZoom', 'intersectY'], and: {
				op: 'call', id: 'getYIntersect', and: ['½viewportHeight', 'lockAngle', 'α'],
			}},
			'',
			{op: 'return', and: {op: 'array', and: ['intersectZoom', 0, 'intersectY']}},
		]},
		'',
		{op: '=', id: ['intersectZoom', 'intersectX'], and: {
			op: 'call', id: 'getXIntersect', and: ['½viewportHeight', {op: '+', and: ['α', 'θ']}, 'α'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			'intersectZoom',
			{op: '?', and: ['isEvenQuadrant', 'intersectX', {op: '-', and: 'intersectX'}]},
			0,
		]}},
	]},
	// todo rename all the "first, second, third" stuff to "origin, connector, lock"
	{op: 'func', id: 'getFirstEnd', args: ['firstZoom', 'secondZoom', 'secondX', 'secondY'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '==', and: ['secondY', 0]},
			{op: 'return', and: {op: 'array', and: [
				{op: '/', and: [
					'secondX',
					{op: '-', and: [1, {op: '/', and: ['firstZoom', 'secondZoom']}]},
				]},
				0,
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', and: [
			0,
			{op: '/', and: [
				'secondY',
				{op: '-', and: [1, {op: '/', and: ['firstZoom', 'secondZoom']}]},
			]},
		]}},
	]},
	{op: 'func', id: 'getRails', type: ['zoom', 'x', 'y', 'zoom', 'xvp', 'yvp', 'zoom', 'x', 'y', 'zoom', 'xvp', 'yvp'], pair: [,2, 1,,5, 4,,8, 7,,11, 10], multilineResult: 2, and: [
		{op: '=', id: ['zoomSide', 'zoomBase'], and: {
			op: 'call', id: 'getStartZooms',
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
		{op: '=', id: 'cornerAngle', type: 'angle', and: {
			op: 'atan', and: {
				op: '/', and: ['imageHeight', 'imageWidth'],
			},
		}},
		'',
		{op: '=', id: ['intersectSideZoom', 'intersectSideX', 'intersectSideY'], and: {
			op: 'call', id: 'getIntersectSide', and: [
				'cornerAngle',
				'αSide',
				'θ',
				'isEvenQuadrant',
			],
		}},
		{op: '=', id: ['intersectBaseZoom', 'intersectBaseX', 'intersectBaseY'], and: {
			op: 'call', id: 'getIntersectBase', and: [
				'cornerAngle',
				'αBase',
				'θ',
				'isEvenQuadrant',
			],
		}},
		'',
		{op: '=', id: ['endXSide', 'endYSide'], and: {
			op: 'call', id: 'getFirstEnd', and: [
				'zoomSide', 'intersectSideZoom', 'intersectSideX', 'intersectSideY',
			],
		}},
		{op: '=', id: ['endXBase', 'endYBase'], and: {
			op: 'call', id: 'getFirstEnd', and: [
				'zoomBase', 'intersectBaseZoom', 'intersectBaseX', 'intersectBaseY',
			],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: {op: 'array', multiline: 2, and: [
				'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'endXSide', 'endYSide',
				'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'endXBase', 'endYBase',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: 2, and: [
			'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'endXBase', 'endYBase',
			'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'endXSide', 'endYSide',
		]}},
	]},
	{op: 'func', id: 'isBelow', args: ['secondX', 'secondY', 'cornerX', 'cornerY'], and: [
		{op: '=', id: 'm', and: {
			op: '/', and: [
				{op: '-', and: ['cornerY', 'secondY']},
				{op: '-', and: ['cornerX', 'secondX']},
			],
		}},
		'',
		{op: '=', id: 'c', and: {
			op: '-', and: ['secondY', {op: '*', and: ['m', 'secondX']}],
		}},
		'',
		{op: 'return', and: {
			op: '<', and: [
				'y',
				{op: '+', and: [{op: '*', and: ['m', 'x']}, 'c']},
			],
		}},
	]},
	{op: 'func', id: 'getQuadrant', and: [
		{op: 'if', and: [
			{op: '>', and: ['x', 0]},
			{op: 'if', and: [
				{op: '>', and: ['y', 0]},
				{op: 'return', and: {op: 'array', and: [
					{op: 'call', id: 'isBelow', and: ['x1', 'y1', 0.5, 0.5]},
					false,
				]}},
			]},
			'',
			{op: 'return', and: {op: 'array', and: [
				true,
				{op: 'call', id: 'isBelow', and: [{op: '-', and: 'x0'}, {op: '-', and: 'y0'}, 0.5, -0.5]},
			]}},
		]},
		'',
		{op: 'if', and: [
			{op: '>', and: ['y', 0]},
			{op: 'return', and: {op: 'array', and: [
				false,
				{op: 'call', id: 'isBelow', and: ['x0', 'y0', -0.5, 0.5]},
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: 'call', id: 'isBelow', and: [{op: '-', and: 'x1'}, {op: '-', and: 'y1'}, -0.5, -0.5]},
			true,
		]}},
	]},
];

let getTraceVars;
let getShortPanVars;

export default {
	System,
	start() {
		getTraceVars = getVarGetter(DEGREES[90] - 0.4, 0.75);
		
		getShortPanVars = () => {
			const {zoomPoints, axis, ...data} = singleCornerGetter(mock.getVarGetter.bind(null, (mock) => {
				const allStartZooms = getAllStartZooms(mock);
				const startZooms = [
					Math.min(allStartZooms[0].x, allStartZooms[1].x),
					Math.min(allStartZooms[0].y, allStartZooms[1].y),
				];
				
				const isEvenQuadrant = Math.floor(mock.rotation / DEGREES[90]) % 2 !== 0;
				const quadrantAngle = getQuadrantAngle(mock.rotation, isEvenQuadrant);
				
				return [...getZoomPoints(mock, allStartZooms), ...getPoints(mock, startZooms, quadrantAngle)];
			}));
			
			const first = zoomPoints[zoomPoints[0].z > zoomPoints[2].z ? 2 : 0];
			const end = zoomPoints[axis + 4];
			const zoom = zoomPoints[3].z;
			
			return {first, zoom, startZoom: first.z, start: getZoomProgressed(first, end, zoom), end, ...data};
		};
		
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
			content: IDS.IMAGE,
			style: {textAlign: 'center'},
		},
		[
			'In ', getPageButton(IDS.SINGLE), ', there were two playground states that revealed issues.',
			'Let\'s start by seeing how they look here.',
		],
		[
			'First, the ',
			getButton('state', [
				() => [{position: demo.system.bound1 || {x: 0, y: 0}}, TWEEN_OPTIONS_SETUP],
				({ratio, rotation, zoom}) => [{ratio, rotation, zoom}, getTweenOptionsBound(3)],
			], {getParam: () => getRestrictiveVars()}),
			' that was too restrictive is way better!',
			' ', getPageButton(IDS.CENTER), ' gives users much more viewfinding flexibility, but this seems good enough to avoid frustrating users.',
			'The overly permissive ',
			getButton('state', [[permissiveTweens]]),
			' is also fixed, accurately replicating the behaviour of ', getPageButton(IDS.EDGE), '.',
		],
		[
			getPageButton(IDS.SINGLE),
			' forbade control over rail gradients; ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mi', xmlns, content: 'y'},
				{tag: 'mo', xmlns, content: '='},
				{tag: 'mi', xmlns, content: 'm'},
				{tag: 'mi', xmlns, content: 'x'},
				{tag: 'mo', xmlns, content: '+'},
				{tag: 'mi', xmlns, content: 'c'},
			]},
			' always simplified to ',
			getConnectedPunctuation({tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mi', xmlns, content: 'y'},
				{tag: 'mo', xmlns, content: '='},
				{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: '±'},
				{tag: 'mi', xmlns, content: 'x'},
			]}, '.'),
			' Multi-line rails provide much more flexibility, allowing for manipulation of lock point locations.',
		],
		[
			'This system places each lock point on a different viewport edge.',
			'A point\'s distance along its edge is based on rotation angle.',
			'Specifically, it lies on the expected viewport corners at ',
			getButton('0°', getCornerProgressTweens(DEGREES[90])),
			' and ',
			getConnectedPunctuation(getButton('90°', getCornerProgressTweens(0)), ','),
			' and travels linearly between them for ',
			getConnectedPunctuation(getButton('intermediate angles', [
				...getCornerProgressTweens(DEGREES[90], '<'),
				[{rotation: 0}, {ease: 'none', duration: 3, position: '+=0'}],
			]), '.'),
		],
		[
			'Now that we\'re messing with rail gradients, we need another rail segment to connect back to the origin.',
			'I\'ll call rail segments that determine lock points "lock rails" and the other segments "origin rails".',
		],
		[
			'Similarly to ', getPageButton(IDS.EDGER), ', ',
			// todo there are likely lots of buttons that should be doing manual position setting
			getButton('origin rails', [
				({rotation, ratio, zoomPoints}) => [{position: 0, ratio, rotation, zoom: zoomPoints[2].z}],
				({zoomPoints}) => [{zoom: zoomPoints[3].z}, {...getTweenOptionsBound(2), duration: 3}],
			], {getParam: () => getTraceVars()}),
			' follow image axes.',
			'They end at their intersection with ',
			getConnectedPunctuation(getButton('lock rails', [
				({rotation, ratio, zoomPoints}) => [{position: zoomPoints[3], ratio, rotation, zoom: zoomPoints[3].z}],
				({zoomPoints}) => [{zoom: zoomPoints[3].z * 2}, {...getTweenOptionsBound(3), duration: 3}],
			], {getParam: () => getTraceVars()}), ','),
			' following whichever axis minimises lock rail length.',
		],
		{
			tag: 'h2',
			content: 'Bound Maths',
			style: {textAlign: 'center'},
		},
		[
			'Each lock point must be on a different viewport edge, and adjacent corners will have lock points on adjacent edges.',
			'Since we\'re focusing on adjacent (top-left and top-right) image corners, we can say that one will be a viewport side corner and the other a viewport base corner.',
			'Corners will alternate between base and side every 90°.',
		],
		[
			'Like origin rail start zooms, which are found via the same maths as in ', getPageButton(IDS.SINGLE), ', lock rails are found through trigonometry.',
			'There are four kinds of lock rail;',
			'they can start from either axis and end at either a side or base corner.',
			'Each of the four variations has slightly different formulae, but they all present similar problems with similar solutions.',
			'Given below are derivations of start zoom and start position formulae for the x-axis, base corner variant.',
		],
		getDiagrammedMath(
			zoomImage,
			{
				title: 'Variables',
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_ASSERTION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the rails meet at'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'mn', xmlns, content: '0'},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the image\'s width be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '2'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the image\'s height be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '2'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the target start zoom be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'z'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the viewport\'s width at default zoom be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '2'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'v'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the viewport\'s height at default zoom be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '2'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'v'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: 'Declarations',
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'A'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'mn', xmlns, content: '0'},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'B'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'C'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mo', xmlns, content: '|'},
								]},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'v'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
									{tag: 'mi', xmlns, content: 'z'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'E'},
									{tag: 'mo', xmlns, content: '|'},
								]},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'v'},
										{tag: 'mi', xmlns, content: 'w'},
									]},
									{tag: 'mi', xmlns, content: 'z'},
								]},
							]},
						]},
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
								{tag: 'mi', xmlns, content: 'α'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'the desired lock rail angle'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '∠'},
								{tag: 'mi', xmlns, content: 'B'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'C'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'θ'},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'α'},
							]},
						]},
					]},
				],
			},
			{
				title: {tag: 'mi', xmlns, content: 'α'},
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
							{tag: 'mtr', xmlns, content: [
								{tag: 'mtd', xmlns, content: [
									{tag: 'mfrac', xmlns, content: [
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '|'},
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mo', xmlns, content: '|'},
										]},
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '|'},
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mi', xmlns, content: 'E'},
											{tag: 'mo', xmlns, content: '|'},
										]},
									]},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mtd', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mfrac', xmlns, content: [
											{tag: 'mrow', xmlns, content: [
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'mi', xmlns, content: 'θ'},
											]},
											{tag: 'mrow', xmlns, content: [
												{tag: 'mn', xmlns, content: '45'},
												{tag: 'mo', xmlns, content: '°'},
											]},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mn', xmlns, content: '1'},
										{tag: 'mo', xmlns, content: '|'},
									]},
									{tag: 'mo', xmlns, content: '='},
									{tag: 'mi', xmlns, content: 'p'},
								]},
							]},
							{tag: 'mtr', xmlns, content: [
								{tag: 'mtd', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'D'},
										{tag: 'mi', xmlns, content: 'C'},
										{tag: 'mo', xmlns, content: '|'},
									]},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mtd', xmlns, content: [
									{tag: 'mi', xmlns, content: 'p'},
									{tag: 'mo', xmlns, content: '×'},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'D'},
										{tag: 'mi', xmlns, content: 'E'},
										{tag: 'mo', xmlns, content: '|'},
									]},
									{tag: 'mo', xmlns, content: '='},
									{tag: 'mi', xmlns, content: 'p'},
									{tag: 'mo', xmlns, content: '×'},
									{tag: 'mfrac', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
										{tag: 'mi', xmlns, content: 'z'},
									]},
								]},
							]},
							{tag: 'mtr', xmlns, content: [
								{tag: 'mtd', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mo', xmlns, content: '∠'},
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: ')'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mtd', xmlns, content: [
									{tag: 'mfrac', xmlns, content: [
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '|'},
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mo', xmlns, content: '|'},
										]},
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '|'},
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mo', xmlns, content: '|'},
										]},
									]},
									{tag: 'mo', xmlns, content: '='},
									{tag: 'mfrac', xmlns, content: [
										{tag: 'mrow', xmlns, content: [
											{tag: 'mi', xmlns, content: 'p'},
											{tag: 'mo', xmlns, content: '×'},
											{tag: 'mfrac', xmlns, content: [
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'v'},
													{tag: 'mi', xmlns, content: 'w'},
												]},
												{tag: 'mi', xmlns, content: 'z'},
											]},
										]},
										{tag: 'mrow', xmlns, content: [
											{tag: 'mfrac', xmlns, content: [
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'v'},
													{tag: 'mi', xmlns, content: 'h'},
												]},
												{tag: 'mi', xmlns, content: 'z'},
											]},
										]},
									]},
									{tag: 'mo', xmlns, content: '='},
									{tag: 'mi', xmlns, content: 'p'},
									{tag: 'mo', xmlns, content: '×'},
									{tag: 'mfrac', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
									]},
								]},
							]},
							{tag: 'mtr', xmlns, content: [
								{tag: 'mtd', xmlns, content: [
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: '='},
									{tag: 'mo', xmlns, content: '∠'},
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mtd', xmlns, content: [
									{tag: 'msup', xmlns, content: [
										{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '-'},
											{tag: 'mn', xmlns, content: '1'},
										]},
									]},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'p'},
									{tag: 'mo', xmlns, content: '×'},
									{tag: 'mfrac', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
									]},
									{tag: 'mo', xmlns, content: ')'},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: [
					{tag: 'mo', xmlns, content: '|'},
					{tag: 'mi', xmlns, content: 'A'},
					{tag: 'mi', xmlns, content: 'C'},
					{tag: 'mo', xmlns, content: '|'},
				],
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mo', xmlns, content: '∠'},
								{tag: 'mi', xmlns, content: 'B'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'C'},
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
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '|'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'C'},
								{tag: 'mo', xmlns, content: '|'},
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
										{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'mo', xmlns, content: '∠'},
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'C'},
										{tag: 'mo', xmlns, content: ')'},
									]},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'i'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'mi', xmlns, content: 'θ'},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'α'},
										{tag: 'mo', xmlns, content: ')'},
									]},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: {tag: 'mi', xmlns, content: 'z'},
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: ')'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'D'},
										{tag: 'mo', xmlns, content: '|'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'C'},
										{tag: 'mo', xmlns, content: '|'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'α'},
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
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'v'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
									{tag: 'mi', xmlns, content: 'z'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'z'},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'v'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
											{tag: 'mo', xmlns, content: '('},
											{tag: 'mi', xmlns, content: 'α'},
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
				],
			},
			{
				title: {tag: 'mi', xmlns, content: 'x'},
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'θ'},
									{tag: 'mo', xmlns, content: '+'},
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: ')'},
								]},
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
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mo', xmlns, content: '|'},
									]},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'x'},
									]},
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'i'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
								{tag: 'mo', xmlns, content: '×'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'θ'},
									{tag: 'mo', xmlns, content: '+'},
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: ')'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mi', xmlns, content: 'x'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'x'},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'i'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
									{tag: 'mo', xmlns, content: '×'},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'mi', xmlns, content: 'θ'},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'α'},
										{tag: 'mo', xmlns, content: ')'},
									]},
								]},
							]},
						]},
					]},
				],
			},
		),
		[
			'That math is used by ', {tag: 'i', content: 'getRails'}, ' below, which returns rail endpoints and start zooms.',
			'If you want to know how the other lock rail variants are handled, see ', {tag: 'i', content: 'getIntersectSide'}, ' and ', {tag: 'i', content: 'getIntersectBase'}, '.',
		],
		getCode(code, [
			{op: '=', id: [
				'originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0',
				'originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1',
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
			'There\'s no huge flaw, but this system\'s user experience is pretty terrible.',
			'Take ',
			getButton('this', [
				({ratio, rotation}) => [{ratio, rotation, zoom: 1, position: 0}],
			], {
				getParam: singleCornerGetter.bind(null, getVarGetter),
			}),
			' state for example — see the panning path necessary to view the offscreen corner?',
			'There\'s no way anyone would take that path naturally.',
			'Users naturally try to take the ',
			getButton('shortest', [
				({rotation, ratio, startZoom}) => [{rotation, ratio, zoom: startZoom, position: 0}],
				({start}) => [{target: start}],
				({first, end, start, zoom}) => [{zoom, target: start}, {
					isPositionUpdate: true,
					onUpdate() {
						const {x, y} = getZoomProgressed(first, end, demo.zoom);
						
						demo.position.x = x;
						demo.position.y = y;
						
						demo.applyPosition();
					},
				}],
			], {getParam: () => getShortPanVars()}),
			' path possible, but this system doesn\'t often allow that.',
			'Having to pan farther than expected, and getting ',
			getButton('shunted', [
				({rotation, ratio, zoom}) => [{rotation, ratio, zoom, position: 0}],
				({start}) => [{position: start}, {delay: 0.2}],
			], {getParam: () => getShortPanVars()}),
			' in an unexpected direction, is frustrating for users.',
		],
		[
			'The ideal bounding system is one that users find so natural and unintrusive that they don\'t consciously notice it.',
			'Some degree of intrusiveness is necessary with zoomful systems, but there\'s no attempt at mitigation here.',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'The maths here build upon those of the single-line system.',
			'As before, a lock rail is snipped to achieve matching start zooms.',
			'Now, however, the snipped part of the lock rail must be paired with the end of its partner\'s origin rail.',
			'If the origin rails don\'t share a gradient, one last snip is necessary to match zooms for origin rails.',
		],
		[
			'The final product may have either two or three segments, as seen below.',
			'Segments are coloured to show pairings.',
		],
		getDoubleImage(snapImageDuo, snapImageTrio),
		[
			'As before, we need to find a line that intersects the snap point and two adjacent rails.',
			'Here, with the additional segment pairs, the maximum number of checks required is tripled.',
		],
		getCode(code, [
			{op: '=', id: 'match0', and: {op: '||', and: [
				{op: '==', and: ['endX0', 'endX1']},
				{op: '==', and: ['endY0', 'endY1']},
			]}},
			{op: '=', id: ['flip0', 'flip1'], and: {
				op: 'call', id: 'getQuadrant',
			}},
			'',
			{op: '=', id: 'snapZoom', and: {
				op: 'call', id: 'getZoom', and: ['flip0', 'flip1', {op: '!=', and: ['flip0', 'flip1']}],
			}},
		]),
		{
			tag: 'h2',
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		getInstruction([
			'If pink text has a ', {tag: 'span', style: {textDecoration: 'wavy underline'}, content: 'wavy underline'}, ', its behaviour is randomised.',
			'Each visualisation will be unique unless retriggered while rewinding.',
		]),
		[
			'As a snap-panning facilitator, this system is hard to fault.',
			'Of course, it performs fine with ',
			getButton('similar', ...boundGetSnapTweens(() => Math.random() / 5 + 0.9)),
			' aspect ratios, but it performs equally well with ',
			getButton('distant', ...boundGetSnapTweens(() => Math.random() / 10 + 0.2)),
			' aspect ratios.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'This system\'s not a great pan-limiter, but it\'s an effective snap-panner.',
			'It complements ', getPageButton(IDS.CENTER), ' well.',
			'The two systems synergise perfectly, covering each other\'s weakness to create a superior product.',
		],
		{
			tag: 'div', style: {textAlign: 'center', fontSize: '1.8em'}, content: '🥳',
		},
		[
			'By combining systems, we\'ve finally conquered rotation!',
			'This is a win, but perhaps more second act climax than final, supreme victory.',
		],
		[
			'I\'d feel a lot more satisfied with this system if it weren\'t such a weak pan-limiter.',
			'How about we try fixing it?',
			'Can we devise a system that handles rotation while succeeding at both bounding ', {tag: 'i', content: 'and'}, ' snap-panning?',
		],
	),
};
