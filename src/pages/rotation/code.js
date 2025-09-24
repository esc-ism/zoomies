const SINGLE_LINE = [
	{op: 'func', id: 'getIntersectRatio', args: ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'isInverse'], and: [
		{op: '=', id: 'a', and: {
			op: '-', and: [
				{op: '+', and: [
					{op: '*', and: ['g', 'j']},
					{op: '*', and: ['e', 'h']},
					{op: '*', and: ['k', 'd']},
					{op: '*', and: ['i', 'f']},
				]},
				{op: '*', and: ['g', 'h']},
				{op: '*', and: ['j', 'e']},
				{op: '*', and: ['k', 'f']},
				{op: '*', and: ['i', 'd']},
			],
		}},
		{op: '=', id: 'b', and: {
			op: '-', and: [
				{op: '+', and: [
					{op: '*', and: ['g', 'h']},
					{op: '*', and: ['e', 'x']},
					{op: '*', and: ['j', 'e']},
					{op: '*', and: ['k', 'x']},
					{op: '*', and: ['i', 'd', 2]},
					{op: '*', and: ['f', 'y']},
					{op: '*', and: ['h', 'y']},
				]},
				{op: '*', and: ['g', 'x']},
				{op: '*', and: ['e', 'h', 2]},
				{op: '*', and: ['j', 'y']},
				{op: '*', and: ['k', 'd']},
				{op: '*', and: ['i', 'x']},
				{op: '*', and: ['f', 'i']},
				{op: '*', and: ['d', 'y']},
			],
		}},
		{op: '=', id: 'c', and: {
			op: '-', and: [
				{op: '+', and: [
					{op: '*', and: ['h', 'e']},
					{op: '*', and: ['i', 'x']},
					{op: '*', and: ['d', 'y']},
				]},
				{op: '*', and: ['e', 'x']},
				{op: '*', and: ['h', 'y']},
				{op: '*', and: ['d', 'i']},
			],
		}},
		'',
		{op: 'if', and: [
			'isInverse',
			{op: 'return', and: {
				op: '/', and: [
					{op: '-', and: [
						{op: '-', and: 'b'},
						{op: 'root', and: {
							op: '-', and: [
								{op: 'pow', and: 'b'},
								{op: '*', and: [4, 'a', 'c']},
							],
						}},
					]},
					{op: '*', and: [2, 'a']},
				],
			}},
		]},
		{op: 'return', and: {
			op: '/', and: [
				{op: '+', and: [
					{op: '-', and: 'b'},
					{op: 'root', and: {
						op: '-', and: [
							{op: 'pow', and: 'b'},
							{op: '*', and: [4, 'a', 'c']},
						],
					}},
				]},
				{op: '*', and: [2, 'a']},
			],
		}},
	]},
	{op: 'func', id: 'getAllStartZooms', type: ['zoom', 'zoom', 'zoom', 'zoom'], and: [
		{op: '=', id: 'offset', type: 'angle', and: {
			op: 'atan', and: {
				op: '/', and: ['imageWidth', 'imageHeight'],
			},
		}},
		'',
		{op: '=', id: 'topLeftAngle', type: 'angle', and: {
			op: '+', and: ['rotation', 'offset'],
		}},
		{op: '=', id: 'topRightAngle', type: 'angle', and: {
			op: '-', and: ['rotation', 'offset'],
		}},
		'',
		{op: '=', id: 'distance', type: 'position', angle: 'topRightAngle', isPercent: false, and: {
			op: 'root', and: {
				op: '+', and: [
					{op: 'pow', and: '½imageWidth'},
					{op: 'pow', and: '½imageHeight'},
				],
			},
		}},
		'',
		{op: 'return', multiline: true, and: [
			{op: '/', and: [
				'½viewportWidth',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'cos', and: 'topLeftAngle'},
					],
				}},
			]},
			{op: '/', and: [
				'½viewportHeight',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'sin', and: 'topLeftAngle'},
					],
				}},
			]},
			{op: '/', and: [
				'½viewportWidth',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'cos', and: 'topRightAngle'},
					],
				}},
			]},
			{op: '/', and: [
				'½viewportHeight',
				{op: 'abs', and: {
					op: '*', and: [
						'distance',
						{op: 'sin', and: 'topRightAngle'},
					],
				}},
			]},
		]},
	]},
];

export default SINGLE_LINE;

export const MULTI_LINE = [
	...SINGLE_LINE,
	{op: 'func', id: 'getStartZooms', type: ['zoom', 'zoom'], and: [
		{op: '=', id: ['topLeftX', 'topLeftY', 'topRightX', 'topRightY'], and: {
			op: 'call', id: 'getAllStartZooms',
		}},
		'',
		{op: 'return', multiline: true, and: [
			{op: 'min', and: ['topLeftX', 'topRightX']},
			{op: 'min', and: ['topLeftY', 'topRightY']},
		]},
	]},
	{op: 'func', id: 'getViewportPoints', args: ['zoomSide', 'zoomBase'], type: ['xvp', 'yvp', 'xvp', 'yvp'], pair: [1, 0, 3, 2], and: [
		{op: '=', id: 'rightX', isPercent: false, type: 'xvp', and: {
			op: '/', and: ['½viewportWidth', 'zoomSide'],
		}},
		{op: '=', id: 'topY', isPercent: false, type: 'yvp', and: {
			op: '/', and: ['½viewportHeight', 'zoomBase'],
		}},
		'',
		{op: '=', id: 'rightTheta', type: 'angle', and: {
			op: '-', and: ['½π', 'rotation'],
		}},
		{op: '=', id: 'topTheta', type: 'angle', and: {
			op: '+', and: ['rightTheta', '½π'],
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
	{op: 'func', id: 'getQuadrantAngle', args: ['isEvenQuadrant'], type: 'angle', and: [
		{op: '=', id: 'angle', type: 'angle', and: {
			op: '%', and: [
				{op: '+', and: [
					'rotation',
					{op: '*', and: ['π', 2]},
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
			op: '-', and: ['½π', 'angle'],
		}},
	]},
	{op: 'func', id: 'getProgressed', args: ['fromX', 'fromY', 'toX', 'toY', 'lowZoom', 'highZoom'], pair: [1, 0], and: [
		{op: '=', id: 'p', and: {
			op: '-', and: [
				1,
				{op: '/', and: ['lowZoom', 'highZoom']},
			],
		}},
		'',
		{op: 'return', and: [
			{op: '+', and: [
				'fromX',
				{op: '*', and: [
					'p',
					{op: '-', and: ['toX', 'fromX']},
				]},
			]},
			{op: '+', and: [
				'fromY',
				{op: '*', and: [
					'p',
					{op: '-', and: ['toY', 'fromY']},
				]},
			]},
		]},
	]},
	// todo check if isBase works
	{op: 'func', id: 'getProgressAngles', args: ['quadrantAngle'], type: ['angle', 'angle'], isBase: [false, true], and: [
		{op: '=', id: 'progress', and: {
			op: '+', and: [
				{op: '*', and: [
					{op: '/', and: ['quadrantAngle', '½π']},
					-2,
				]},
				1,
			],
		}},
		'',
		{op: '=', id: 'angleSide', type: 'angle', and: {
			op: 'atan', and: {
				op: '*', and: [
					'progress',
					{op: '/', and: ['viewportHeight', 'viewportWidth']},
				],
			},
		}},
		{op: '=', id: 'angleBase', type: 'angle', isBase: true, and: {
			op: 'atan', and: {
				op: '*', and: [
					'progress',
					{op: '/', and: ['viewportWidth', 'viewportHeight']},
				],
			},
		}},
		'',
		{op: 'return', and: ['angleSide', 'angleBase']},
	]},
	{op: 'func', id: 'getYIntersect', args: ['viewportSize', 'cornerAngle', 'progressAngle'], type: ['y', 'zoom'], and: [
		{op: 'return', multiline: true, and: [
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
		]},
	]},
];
