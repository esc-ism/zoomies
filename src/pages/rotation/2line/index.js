import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import {DOUBLE_LINE as SHARED_FUNCTIONS} from '../code';
import Demo, {getSnappedZoom} from './demo';
import * as mock from '../mock';
import getZoomPoints from './zoomPoints';

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const getLimitedPosition = (limit = 0.4) => Math.max(-limit, Math.min(limit, Math.random() - 0.5));

const getSnapVarGetter = async (demo, getRatio) => {
	const position = {x: getLimitedPosition(), y: getLimitedPosition()};
	const {zoomPoints, rotation, ratio} = await getVarGetter(demo, Math.random() * DEGREES[180], getRatio())();
	
	const zoom = getSnappedZoom(...zoomPoints, position);
	
	return {ratio, rotation, startZoom: Math.min(zoomPoints[0].z, zoomPoints[2].z), zoom, position};
};

export const getSnapTweens = (demo, getRatio) => [
	[
		({rotation, ratio, startZoom}) => [{rotation, ratio, zoom: startZoom, position: 0}],
		({position}) => [{position}],
		({zoom}) => [{zoom}, {duration: 0}],
	],
	{getParam: getSnapVarGetter.bind(null, demo, getRatio)},
];

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
	
	const getTraceVars = getVarGetter(demo, DEGREES[90] - 0.4, 0.75);
	const getDirectVars = getVarGetter(demo, DEGREES[90] - 0.4);
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				tag: 'h1',
				content: 'Doubled Down Rotation',
				style: {textAlign: 'center'},
			},
			[
				'New idea! Let\'s move the goalposts!',
				'Can we find a system that handles rotation and succeeds at both pan-limiting ', {tag: 'i', content: 'and'}, ' snap-panning?',
			],
			[
				'In this system, ',
				getButton('origin rails', [
					({rotation, ratio, first}) => [{position: 0, ratio, rotation, zoom: first.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'  follow viewport axes until they intersect ',
				getButton('lock rails', [
					({rotation, ratio, second}) => [{position: second, ratio, rotation, zoom: second.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z * 2}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'.',
			],
			[
				'Again, whichever origin rail direction minimises lock rail length is preferred.',
				'If a direction gives an intersect with a y coordinate over 0.5, it\'s disqualified.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
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
				'As a snap-panning facilitator, this system is hard to fault.',
				'Of course it performs fine on ',
				getButton('similar', ...getSnapTweens(demo, () => Math.random() / 5 + 0.9)),
				' aspect ratios,',
				'but even ',
				getButton('distant', ...getSnapTweens(demo, () => Math.random() / 10 + 0.2)),
				' aspect ratios reveal no flaw in its ability to derive sensible zoom levels.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'Besides efficiency, the system\'s only drawback is its spotty pan-limiting when image aspect ratio isn\'t 1:1.',
				'It\'s possible to solve this problem by approaching origin tracks differently.',
				'For example, basing their gradients on image axes instead of viewport axes.',
				'This, however, is accepting defeat!',
				'Viewport axis-based origin rails allow users to take the most direct possible path when ',
				getButton('panning', [
					({rotation, ratio, second}) => [{rotation, ratio, zoom: second.z, position: 0}],
					({second}) => [{position: second}, {delay: 0.5}],
					({first}) => [{position: first.end}, {duration: 0}],
				], {getParam: getDirectVars}),
				' to an offscreen corner.',
				'A different approach means accepting sub-optimal paths, providing a worse user experience.',
				'There must be a way to make it work!',
			],
		),
	);
	
	return demo;
};
