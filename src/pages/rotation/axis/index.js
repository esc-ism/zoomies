import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';
import {badTweens} from '../origin';

import Demo, {getSnappedZoom, getZoomPoints} from './demo';

export const getDimensions = (ratio, {width, height}) => {
	const dimensions = {};
	
	if (ratio < 1) {
		dimensions.width = width;
		dimensions.height = height * ratio;
	} else {
		dimensions.width = width / ratio;
		dimensions.height = height;
	}
	
	return {
		...dimensions,
		halfWidth: dimensions.width / 2,
		halfHeight: dimensions.height / 2,
	};
};

const getVarGetter = (demo, rotation = DEGREES[90], ratio = 1) => () => {
	const [first, second] = getZoomPoints(
		rotation,
		demo.viewportDimensions,
		getDimensions(ratio, demo.viewportDimensions),
	).slice(2);
	
	return {first, second, rotation, ratio};
};

const getCornerProgressTweens = (rotation) => [
	[{ratio: 1, zoom: 1, position: 0.5}],
	[{rotation}, {delay: 0.2}],
];

const getLimitedPosition = (limit = 0.4) => Math.max(-limit, Math.min(limit, Math.random() - 0.5));

const getSnapVars = (demo, getRatio) => {
	const ratio = getRatio();
	const rotation = Math.random() * DEGREES[180];
	const position = {x: getLimitedPosition(), y: getLimitedPosition()};
	
	const zoomPoints = getZoomPoints(
		rotation,
		demo.viewportDimensions,
		getDimensions(ratio, demo.viewportDimensions),
	);
	
	const zoom = getSnappedZoom(...zoomPoints, position);
	
	return {ratio, rotation, startZoom: Math.min(zoomPoints[0].z, zoomPoints[2].z), zoom, position};
};

export const getSnapTweens = (demo, getRatio) => [
	[
		({rotation, ratio, startZoom}) => [{rotation, ratio, zoom: startZoom, position: 0}],
		({position}) => [{position}],
		({zoom}) => [{zoom}, {duration: 0}],
	],
	{getParam: getSnapVars.bind(null, demo, getRatio)},
];

const functions = [
	{op: 'func', id: 'getAllStartZooms', and: [
		{op: '=', id: 'offset', type: 'angle', and: {
			op: 'atan', and: {
				op: '/', and: [
					'imageWidth',
					'imageHeight',
				],
			},
		}},
		'',
		{op: '=', id: 'topLeftAngle', type: 'angle', and: {
			op: '+', and: [
				'rotation',
				'offset',
			],
		}},
		{op: '=', id: 'topRightAngle', type: 'angle', and: {
			op: '-', and: [
				'rotation',
				'offset',
			],
		}},
		'',
		{op: '=', id: 'distance', type: 'position', angle: 'topRightAngle', and: {
			op: 'root', and: {
				op: '+', and: [
					{op: 'pow', and: 'image½Width'},
					{op: 'pow', and: 'image½Height'},
				],
			},
		}},
		'',
		{op: 'return', multiline: true, and: [
			{op: '/', and: [
				'viewport½Width',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'cos', and: 'topLeftAngle'},
					],
				}},
			]},
			{op: '/', and: [
				'viewport½Height',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'sin', and: 'topLeftAngle'},
					],
				}},
			]},
			{op: '/', and: [
				'viewport½Width',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'cos', and: 'topRightAngle'},
					],
				}},
			]},
			{op: '/', and: [
				'viewport½Height',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'sin', and: 'topRightAngle'},
					],
				}},
			]},
		]},
	]},
	{op: 'func', id: 'getStartZooms', and: [
		{op: '=', id: ['topLeftX', 'topLeftY', 'topRightX', 'topRightY'], and: {
			op: 'call', id: 'getAllStartZooms',
		}},
		'',
		{op: 'return', multiline: true, and: [
			{op: 'min', and: ['topLeftX', 'topRightX']},
			{op: 'min', and: ['topLeftY', 'topRightY']},
		]},
	]},
	{op: 'func', id: 'getViewportPoints', args: ['zoomSide', 'zoomBase'], and: [
		{op: '=', id: 'rightX', and: {
			op: '/', and: [
				'viewport½Width',
				'zoomSide',
			],
		}},
		{op: '=', id: 'topY', and: {
			op: '/', and: [
				'viewport½Height',
				'zoomBase',
			],
		}},
		'',
		{op: '=', id: 'rightTheta', and: {
			op: '-', and: [
				'½π',
				'rotation',
			],
		}},
		{op: '=', id: 'topTheta', and: {
			op: '+', and: [
				'rightTheta',
				'½π',
			],
		}},
		'',
		{op: 'return', multiline: true, and: [
			{op: '/', and: [
				{op: '*', and: [
					'rightX',
					{op: 'cos', and: 'rightTheta'},
				]},
				'imageWidth',
			]},
			{op: '/', and: [
				{op: '*', and: [
					'rightX',
					{op: 'sin', and: 'rightTheta'},
				]},
				'imageHeight',
			]},
			{op: '/', and: [
				{op: '*', and: [
					'topY',
					{op: 'cos', and: 'topTheta'},
				]},
				'imageWidth',
			]},
			{op: '/', and: [
				{op: '*', and: [
					'topY',
					{op: 'sin', and: 'topTheta'},
				]},
				'imageHeight',
			]},
		]},
	]},
	{op: 'func', id: 'getQuadrantAngle', args: ['isEvenQuadrant'], and: [
		{op: '=', id: 'angle', and: {
			op: '%', and: [
				{op: '+', and: [
					'rotation',
					{op: '*', and: [
						'π',
						2,
					]},
				]},
				'½π',
			],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: 'angle'},
		]},
		'',
		{op: 'return', and: {
			op: '-', and: [
				'½π',
				'angle',
			],
		}},
	]},
	{op: 'func', id: 'getIntersection', args: ['viewportX', 'viewportY', 'axisY', 'cornerX', 'axisZoom'], and: [
		{op: '=', id: 'c', and: {
			op: '*', and: ['cornerX', 'axisY'],
		}},
		'',
		{op: '=', id: 'd', and: {
			op: '-', and: [
				{op: '*', and: [{op: '-', and: 'viewportY'}, 'cornerX']},
				{op: '*', and: ['viewportX', {op: '-', and: ['axisY', 0.5]}]},
			],
		}},
		'',
		{op: '=', id: 'intersectX', and: {
			op: '/', and: [
				{op: '*', and: [{op: '-', and: 'viewportX'}, 'c']},
				'd',
			],
		}},
		{op: '=', id: 'intersectY', and: {
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
		{op: 'return', and: [
			'intersectX',
			'intersectY',
			{op: '/', and: [
				'axisZoom',
				{op: '-', and: [1, 'progress']},
			]},
			'axisY',
		]},
	]},
	{op: 'func', id: 'getCloseIntersection', args: ['rightX', 'rightY', 'topX', 'topY', 'axisY', 'axisZoom', 'isLeft'], and: [
		{op: '=', id: 'cornerX', and: {
			op: '?', and: [
				'isLeft',
				-0.5,
				0.5,
			],
		}},
		{op: '=', multiline: true, id: ['intersectRightX', 'intersectRightY', 'intersectRightZoom', 'intersectRightC'], and: {
			op: 'call', id: 'getIntersection', and: ['rightX', 'rightY', 'axisY', 'cornerX', 'axisZoom'],
		}},
		{op: '=', multiline: true, id: ['intersectTopX', 'intersectTopY', 'intersectTopZoom', 'intersectTopC'], and: {
			op: 'call', id: 'getIntersection', and: ['topX', 'topY', 'axisY', 'cornerX', 'axisZoom'],
		}},
		'',
		{op: 'if', and: [
			{op: '>', and: ['intersectRightZoom', 'intersectTopZoom']},
			{op: 'return', and: ['intersectRightX', 'intersectRightY', 'intersectRightZoom', 'intersectRightC', 'rightX', 'rightY']},
		]},
		'',
		{op: 'return', and: ['intersectTopX', 'intersectTopY', 'intersectTopZoom', 'intersectTopC', 'topX', 'topY']},
	]},
	{op: 'func', id: 'getZoomPoints', and: [
		{op: '=', id: ['zoomSide', 'zoomBase'], and: {
			op: 'call', id: 'getStartZooms',
		}},
		{op: '=', id: 'angle', type: 'angle', and: {
			op: '%', and: [
				{op: '-', and: [
					'½π',
					'rotation',
				]},
				'π',
			],
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
						op: '/', and: [
							'rotation',
							'½π',
						],
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
		{op: '=', id: 'progress', and: {
			op: '+', and: [
				{op: '*', and: [
					{op: '/', and: [
						'quadrantAngle',
						'½π',
					]},
					-2,
				]},
				1,
			],
		}},
		{op: '=', id: 'angleBase', type: 'angle', and: {
			op: 'atan', and: {
				op: '*', and: [
					'progress',
					{op: '/', and: [
						'viewportWidth',
						'viewportHeight',
					]},
				],
			},
		}},
		{op: '=', id: 'angleSide', type: 'angle', and: {
			op: 'atan', and: {
				op: '*', and: [
					'progress',
					{op: '/', and: [
						'viewportHeight',
						'viewportWidth',
					]},
				],
			},
		}},
		'',
		{op: '=', id: 'axisIntersectSideAngle', and: {
			op: '+', and: ['quadrantAngle', 'angleSide'],
		}},
		{op: '=', id: 'axisIntersectSideY', and: {
			op: '/', and: [
				{op: '-', and: [
					'image½Height',
					{op: '*', and: [
						'image½Width',
						{op: 'tan', and: 'axisIntersectSideAngle'},
					]},
				]},
				'imageHeight',
			],
		}},
		{op: '=', id: 'axisIntersectSideZoom', and: {
			op: '/', and: [
				'viewport½Width',
				{op: '*', and: [
					{op: 'cos', and: 'angleSide'},
					{op: 'abs', and: {
						op: '/', and: [
							'image½Width',
							{op: 'cos', and: 'axisIntersectSideAngle'},
						],
					}},
				]},
			],
		}},
		'',
		{op: '=', id: 'axisIntersectBaseAngle', and: {
			op: '-', and: ['½π', 'quadrantAngle', 'angleBase'],
		}},
		{op: '=', id: 'axisIntersectBaseY', and: {
			op: '/', and: [
				{op: '-', and: [
					'image½Height',
					{op: '*', and: [
						'image½Width',
						{op: 'tan', and: 'axisIntersectBaseAngle'},
					]},
				]},
				'imageHeight',
			],
		}},
		{op: '=', id: 'axisIntersectBaseZoom', and: {
			op: '/', and: [
				'viewport½Height',
				{op: '*', and: [
					{op: 'cos', and: 'angleBase'},
					{op: 'abs', and: {
						op: '/', and: [
							'image½Width',
							{op: 'cos', and: 'axisIntersectBaseAngle'},
						],
					}},
				]},
			],
		}},
		'',
		{op: '=', multiline: true, id: ['intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideC', 'intersectSideEndX', 'intersectSideEndY'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['rightX', 'rightY', 'topX', 'topY', 'axisIntersectSideY', 'axisIntersectSideZoom', 'isEvenQuadrant'],
		}},
		{op: '=', multiline: true, id: ['intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseC', 'intersectBaseEndX', 'intersectBaseEndY'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['rightX', 'rightY', 'topX', 'topY', 'axisIntersectBaseY', 'axisIntersectBaseZoom', {op: '!', and: 'isEvenQuadrant'}],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: ['zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideC', 'intersectSideEndX', 'intersectSideEndY', 'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseC', 'intersectBaseEndX', 'intersectBaseEndY']},
		]},
		'',
		{op: 'return', and: ['zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseC', 'intersectBaseEndX', 'intersectBaseEndY', 'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideC', 'intersectSideEndX', 'intersectSideEndY']},
	]},
];

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	registerFunctions(demo, functions);
	
	const getTraceVars = getVarGetter(demo, DEGREES[90] - 0.4, 0.75);
	const getDirectVars = getVarGetter(demo, DEGREES[90] - 0.4);
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h1',
				content: 'Good Rotation',
			},
			[
				'Let\'s start by seeing how that ',
				getButton('problematic demo state', demo, [[badTweens]]),
				' looks on this new system',
			],
			[
				'Much better!',
				'This system is equivalent to the prior with shared aspect ratio, but handles ',
				getButton('decoupling', demo, [
					[{...badTweens, ratio: 2, zoom: 1.5}],
					[{ratio: 0.5}, {duration: 5, ease: 'none'}],
				]),
				' much better.',
			],
			[
				'This system keeps each image corner on a different viewport edge.',
				'The corners\' distance along each edge is a ratio based on rotation angle;',
				'if an image corner maps to one viewport corner at ',
				getButton('0°', demo, getCornerProgressTweens(DEGREES[90])),
				' and another at ',
				getButton('90°', demo, getCornerProgressTweens(0)),
				', it travels linearly between them for ',
				getButton('intermediate angles', demo, [
					...getCornerProgressTweens(DEGREES[90]),
					[{rotation: 0}, {ease: 'none', duration: 3}],
				]),
				'.',
			],
			[
				'This is only half of the system, however.',
				'Since points no longer travel directly from the origin towards image corners, we need a smart way to move them from the origin.',
			],
			[
				'This is accomplished here by having them trace along the ',
				getButton('viewport\'s axes', demo, [
					({rotation, ratio, first}) => [{position: 0, ratio, rotation, zoom: first.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				' until they can take a ',
				getButton('corner-bound', demo, [
					({rotation, ratio, second}) => [{position: second, ratio, rotation, zoom: second.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z * 2}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'  path.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			getCode([
				{op: '=', multiline: true, id: ['originZoom0', 'x0', 'y0', 'zoom0', 'c0', 'endX0', 'endY0', 'originZoom1', 'x1', 'y1', 'zoom1', 'c1', 'endX1', 'endY1'], and: {
					op: 'call', id: 'getZoomPoints',
				}},
			]),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'This latter part of the system has upsides and downsides.',
				'On one hand, users can take the most direct possible path when ',
				getButton('panning', demo, [
					({rotation, ratio, second}) => [{rotation, ratio, zoom: second.z, position: 0}],
					({second}) => [{position: second}, {delay: 0.5}],
					({second}) => [{position: second.vpEnd}, {duration: 0}],
				], {getParam: getDirectVars}),
				' to an offscreen corner.',
				'On the other, extreme aspect ratio differentials can cause ',
				getButton('odd behaviour', demo, [
					[{position: 0.5}, {duration: 0}],
					[{ratio: 0.25, zoom: 1}],
					[{rotation: DEGREES[90]}, {duration: 2, delay: 0.2}],
					[{rotation: 0}, {ease: 'none', duration: 5}],
				], {getParam: getDirectVars}),
				' when rotating.',
			],
			[
				'No doubt there\'s a clever way around this flaw; using the image\'s axes instead of the viewport\'s would probably work.',
				'However, acting as a perfect pan-limiting system is beyond the system\'s scope.',
				'Its purpose is to facilitate snap panning, and in this role it\'s hard to fault.',
				'Of course it performs fine on ',
				getButton('similar', demo, ...getSnapTweens(demo, () => Math.random() / 5 + 0.9)),
				' aspect ratios,',
				'but even ',
				getButton('distant', demo, ...getSnapTweens(demo, () => Math.random() / 10 + 0.2)),
				' aspect ratios reveal no flaw in its ability to derive sensible zoom levels.',
			],
		),
	);
	
	return demo;
};
