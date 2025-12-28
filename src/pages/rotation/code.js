export const LERP = [
	{op: 'func', id: 'getProgressed', args: ['fromX', 'fromY', 'toX', 'toY', 'lowZoom', 'highZoom'], description: [
		'The x-coordinate of the rail\'s start point',
		'The y-coordinate of the rail\'s start point',
		'The x-coordinate of the rail\'s horizon',
		'The y-coordinate of the rail\'s horizon',
		'The rail\'s start zoom',
		'The zoom to progress to',
	], pair: [1, 0], and: [
		{op: '=', id: 't', description: 'The amount of progress as a fraction', and: {op: '-', and: [1, {op: '/', and: ['lowZoom', 'highZoom']}]}},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '+', and: ['fromX', {op: '*', and: ['t', {op: '-', and: ['toX', 'fromX']}]}]},
			{op: '+', and: ['fromY', {op: '*', and: ['t', {op: '-', and: ['toY', 'fromY']}]}]},
		]}},
	]},
	{op: 'func', id: 'getθ', type: 'angle', isBase: true, and: [
		{op: '=', id: 'angle', description: 'The rotation\'s difference from the 90° multiple below it', type: 'angle', isBase: true, and: {
			op: '%', and: [{op: '+', and: ['rotation', '2π']}, '½π'],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: 'angle'},
		]},
		'',
		{op: 'return', and: {op: '-', and: ['½π', 'angle']}},
	]},
];

export const SINGLE_LINE = [
	{op: 'func', id: 'getT', args: ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'isInverse'], description: [
		'The x-coordinate of the first rail\'s start point',
		'The y-coordinate of the first rail\'s start point',
		'The x-coordinate of the first rail\'s horizon',
		'The y-coordinate of the first rail\'s horizon',
		'The x-coordinate of the second rail\'s start point',
		'The y-coordinate of the second rail\'s start point',
		'The x-coordinate of the second rail\'s horizon',
		'The y-coordinate of the second rail\'s horizon',
		'True for the left and right regions',
	], and: [
		{op: '=', id: 'a', description: 'A variable in the quadratic formula', and: {
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
		{op: '=', id: 'b', description: 'A variable in the quadratic formula', and: {
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
		{op: '=', id: 'c', description: 'A variable in the quadratic formula', and: {
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
					{op: '-', and: [{op: '-', and: 'b'}, {op: 'root', and: {op: '-', and: [{op: 'pow', and: 'b'}, {op: '*', and: [4, 'a', 'c']}]}}]},
					{op: '*', and: [2, 'a']},
				],
			}},
		]},
		'',
		{op: 'return', and: {
			op: '/', and: [
				{op: '+', and: [{op: '-', and: 'b'}, {op: 'root', and: {op: '-', and: [{op: 'pow', and: 'b'}, {op: '*', and: [4, 'a', 'c']}]}}]},
				{op: '*', and: [2, 'a']},
			],
		}},
	]},
	{op: 'func', id: 'getAllStartZooms', type: ['zoom', 'zoom', 'zoom', 'zoom'], and: [
		{op: '=', id: 'offset', description: 'The angle between the image\'s positive y-axis and its upper corners', type: 'angle', isBase: true, and: {
			op: 'atan', and: {op: '/', and: ['imageWidth', 'imageHeight']},
		}},
		'',
		{op: '=', id: 'topLeftAngle', description: 'The angle between the image\'s un-rotated positive x-axis and its top-left corner', type: 'angle', fight: true, and: {
			op: '+', and: ['rotation', 'offset'],
		}},
		{op: '=', id: 'topRightAngle', description: 'The angle between the image\'s un-rotated positive x-axis and its top-right corner', type: 'angle', fight: true, and: {
			op: '-', and: ['rotation', 'offset'],
		}},
		'',
		{op: '=', id: 'distance', description: 'The distance between the image\'s origin and its corners', type: 'position', angle: 'topRightAngle', isPercent: false, and: {
			op: 'root', and: {op: '+', and: [{op: 'pow', and: '½imageWidth'}, {op: 'pow', and: '½imageHeight'}]},
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '/', and: ['½viewportWidth', {op: 'abs', and: {op: '*', and: ['distance', {op: 'cos', and: 'topLeftAngle'}]}}]},
			{op: '/', and: ['½viewportHeight', {op: 'abs', and: {op: '*', and: ['distance', {op: 'sin', and: 'topLeftAngle'}]}}]},
			{op: '/', and: ['½viewportWidth', {op: 'abs', and: {op: '*', and: ['distance', {op: 'cos', and: 'topRightAngle'}]}}]},
			{op: '/', and: ['½viewportHeight', {op: 'abs', and: {op: '*', and: ['distance', {op: 'sin', and: 'topRightAngle'}]}}]},
		]}},
	]},
];

export const MULTI_LINE = [
	...LERP,
	...SINGLE_LINE,
	{op: 'func', id: 'getIntersectZoom', args: ['startZoom', 'fromX0', 'fromY0', 'toX0', 'toY0', 'fromX1', 'fromY1', 'toX1', 'toY1', 'maxT'], description: [
		'The start zoom for both rails',
		'The x-coordinate of the first rail\'s start point',
		'The y-coordinate of the first rail\'s start point',
		'The x-coordinate of the first rail\'s horizon',
		'The y-coordinate of the first rail\'s horizon',
		'The x-coordinate of the second rail\'s start point',
		'The y-coordinate of the second rail\'s start point',
		'The x-coordinate of the second rail\'s horizon',
		'The y-coordinate of the second rail\'s horizon',
		'The "t" value at which a rail ends',
	], type: 'zoom', and: [
		{op: 'if', and: [
			{op: '>=', and: ['maxT', 0]},
			{op: '=', id: 't', description: 'The fraction of length at which a line through both rails will pass through the snap point', and: {
				op: 'call', id: 'getT', and: ['fromX0', 'fromY0', 'toX0', 'toY0', 'fromX1', 'fromY1', 'toX1', 'toY1', 'isInverse'],
			}},
			'',
			{op: 'if', and: [
				{op: '&&', and: [{op: '>=', and: ['t', 0]}, {op: '<=', and: ['t', 'maxT']}]},
				{op: 'return', and: {op: '/', and: ['startZoom', {op: '-', and: [1, 't']}]}},
			]},
		]},
		'',
		{op: 'return', and: false},
	]},
	{op: 'func', id: 'getStartZooms', type: ['zoom', 'zoom'], and: [
		{op: '=', id: ['topLeftX', 'topLeftY', 'topRightX', 'topRightY'], description: [
			'The zoom at which the image\'s top-left corner touches the viewport\'s left or right edge',
			'The zoom at which the image\'s top-left corner touches the viewport\'s top or bottom edge',
			'The zoom at which the image\'s top-right corner touches the viewport\'s left or right edge',
			'The zoom at which the image\'s top-right corner touches the viewport\'s top or bottom edge',
		], and: {
			op: 'call', id: 'getAllStartZooms',
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: 'min', and: ['topLeftX', 'topRightX']},
			{op: 'min', and: ['topLeftY', 'topRightY']},
		]}},
	]},
	{op: 'func', id: 'getViewportPoints', type: ['xvp', 'yvp', 'xvp', 'yvp'], pair: [1, 0, 3, 2], and: [
		{op: '=', id: 'rightX', description: 'The viewport\'s horizontal radius at zoomSide', isPercent: false, type: 'xvp', and: {
			op: '/', and: ['½viewportWidth', 'zoomSide'],
		}},
		{op: '=', id: 'topY', description: 'The viewport\'s vertical radius at zoomBase', isPercent: false, type: 'yvp', and: {
			op: '/', and: ['½viewportHeight', 'zoomBase'],
		}},
		'',
		{op: '=', id: 'rightTheta', description: 'The angle between the image\'s positive x-axis and its un-rotated positive x-axis', type: 'angle', and: {
			op: '-', and: ['½π', 'rotation'],
		}},
		{op: '=', id: 'topTheta', description: 'The angle between the image\'s positive x-axis and its un-rotated positive y-axis', type: 'angle', and: {
			op: '+', and: ['rightTheta', '½π'],
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '/', and: [{op: '*', and: ['rightX', {op: 'cos', and: 'rightTheta'}]}, 'imageWidth']},
			{op: '/', and: [{op: '*', and: ['rightX', {op: 'sin', and: 'rightTheta'}]}, 'imageHeight']},
			{op: '/', and: [{op: '*', and: ['topY', {op: 'cos', and: 'topTheta'}]}, 'imageWidth']},
			{op: '/', and: [{op: '*', and: ['topY', {op: 'sin', and: 'topTheta'}]}, 'imageHeight']},
		]}},
	]},
	{op: 'func', id: 'getα', type: ['angle', 'angle'], fight: [true, true], isBase: [false, true], and: [
		{op: '=', id: 'progress', description: 'How far the lock point should be from its viewport edge\'s midpoint as a fraction', and: {
			op: '-', and: [1, {op: '/', and: ['θ', '¼π']}],
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: 'atan', and: {op: '*', and: ['progress', {op: '/', and: ['viewportHeight', 'viewportWidth']}]}},
			{op: 'atan', and: {op: '*', and: ['progress', {op: '/', and: ['viewportWidth', 'viewportHeight']}]}},
		]}},
	]},
	{op: 'func', id: 'getYIntersect', args: ['viewportSize', 'cornerAngle', 'α'], description: [
		'A viewport radius',
		'The angle between the lock rail and the x-axis',
		'The angle between the lock rail and an un-rotated axis',
	], type: ['zoom', 'y'], and: [
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '/', and: [
				'viewportSize',
				{op: '*', and: [{op: 'cos', and: 'α'}, {op: 'abs', and: {op: '/', and: ['½imageWidth', {op: 'cos', and: 'cornerAngle'}]}}]},
			]},
			{op: '/', and: [
				{op: '-', and: ['½imageHeight', {op: '*', and: ['½imageWidth', {op: 'tan', and: 'cornerAngle'}]}]},
				'imageHeight',
			]},
		]}},
	]},
	{op: 'func', id: 'getXIntersect', args: ['viewportSize', 'cornerAngle', 'α'], description: [
		'A viewport radius',
		'The angle between the lock rail and the y-axis',
		'The angle between the lock rail and an un-rotated axis',
	], type: ['zoom', 'x'], and: [
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '/', and: [
				'viewportSize',
				{op: '*', and: [{op: 'cos', and: 'α'}, {op: 'abs', and: {op: '/', and: ['½imageHeight', {op: 'cos', and: 'cornerAngle'}]}}]},
			]},
			{op: '/', and: [
				{op: '-', and: ['½imageWidth', {op: '*', and: ['½imageHeight', {op: 'tan', and: 'cornerAngle'}]}]},
				'imageWidth',
			]},
		]}},
	]},
];

export const DOUBLE_LINE = [
	...MULTI_LINE,
	{op: 'func', id: 'getBound', args: ['originZoom', 'midX', 'midY', 'midZoom', 'endX', 'endY', 'isLeft'], description: [
		'The origin rail\'s start zoom',
		'The x-coordinate of the lock rail\'s start point',
		'The y-coordinate of the lock rail\'s start point',
		'The lock rail\'s start zoom',
		'The x-coordinate of the origin rail\'s horizon',
		'The y-coordinate of the origin rail\'s horizon',
		'True if the lock rail\'s horizon is the image\'s top-left corner',
	], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '>', and: ['zoom', 'midZoom']},
			{op: '=', id: 'progress', description: 'The scale increase from the lock rail\'s start zoom', and: {
				op: '/', and: ['zoom', 'midZoom'],
			}},
			{op: '=', id: 'cornerX', description: 'The x-coordinate of the lock rail\'s horizon', type: 'x', and: {
				op: '?', and: ['isLeft', -0.5, 0.5],
			}},
			'',
			{op: 'return', and: {op: 'array', multiline: true, and: [
				{op: '-', and: [
					'cornerX',
					{op: '/', and: [{op: '-', and: ['cornerX', 'midX']}, 'progress']},
				]},
				{op: '-', and: [
					0.5,
					{op: '/', and: [{op: '-', and: [0.5, 'midY']}, 'progress']},
				]},
			]}},
		]},
		'',
		{op: 'if', and: [
			{op: '<=', and: ['zoom', 'originZoom']},
			{op: 'return', and: {op: 'array', and: [0, 0]}},
		]},
		'',
		{op: 'return', and: {op: 'call', id: 'getProgressed', and: [{op: 'pseudo', type: 'x', and: 0}, {op: 'pseudo', type: 'y', and: 0}, 'endX', 'endY', 'originZoom', 'zoom']}},
	]},
	{op: 'func', id: 'getDirected', args: ['endX', 'endY', 'midX', 'midY', 'flip', 'cX'], description: [
		'The x-coordinate of the origin rail\'s horizon',
		'The y-coordinate of the origin rail\'s horizon',
		'The x-coordinate of the lock rail\'s start point',
		'The y-coordinate of the lock rail\'s start point',
		'True if exactly one rail is mirrored',
		'The x-coordinate of the lock rail\'s horizon',
	], type: ['x', 'y', 'x', 'y', 'x', 'y'], pair: [1, 0, 3, 2, 5, 4], and: [
		{op: 'return', and: {
			op: '?', multiline: true, and: [
				'flip',
				{op: 'array', and: [
					{op: '-', and: 'endX'}, {op: '-', and: 'endY'},
					{op: '-', and: 'midX'}, {op: '-', and: 'midY'},
					{op: '-', and: 'cX'}, -0.5,
				]},
				{op: 'array', and: [
					'endX', 'endY',
					'midX', 'midY',
					'cX', 0.5,
				]},
			],
		}},
	]},
	{op: 'func', id: 'getPairings', type: [
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',,
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
	], pair: [
		,2, 1, 4, 3, 6, 5, 8, 7,,
		11, 10, 13, 12, 15, 14, 17, 16,,
		20, 19, 22, 21, 24, 23, 26, 25,
	], multilineResult: [9, 9, 10], and: [
		{op: '=', id: ['dEndX0', 'dEndY0', 'dMidX0', 'dMidY0', 'dCX0', 'dCY0'], description: [
			'The x-coordinate of the first origin rail\'s horizon',
			'The y-coordinate of the first origin rail\'s horizon',
			'The x-coordinate of the first lock rail\'s start point',
			'The y-coordinate of the first lock rail\'s start point',
			'The x-coordinate of the first lock rail\'s horizon',
			'The y-coordinate of the first lock rail\'s horizon',
		], and: {
			op: 'call', id: 'getDirected', and: ['endX0', 'endY0', 'x0', 'y0', 'flip0', {op: 'pseudo', type: 'x', and: -0.5}],
		}},
		{op: '=', id: ['dEndX1', 'dEndY1', 'dMidX1', 'dMidY1', 'dCX1', 'dCY1'], description: [
			'The x-coordinate of the second origin rail\'s horizon',
			'The y-coordinate of the second origin rail\'s horizon',
			'The x-coordinate of the second lock rail\'s start point',
			'The y-coordinate of the second lock rail\'s start point',
			'The x-coordinate of the second lock rail\'s horizon',
			'The y-coordinate of the second lock rail\'s horizon',
		], and: {
			op: 'call', id: 'getDirected', and: ['endX1', 'endY1', 'x1', 'y1', 'flip1', {op: 'pseudo', type: 'x', and: 0.5}],
		}},
		'',
		{op: '=', multiline: 2, id: [
			'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
			'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
		], description: [
			'The start zoom of the post-snip lock rails',
			'The x-coordinate of the first post-snip lock rail\'s start point',
			'The y-coordinate of the first post-snip lock rail\'s start point',
			'The x-coordinate of the first post-snip lock rail\'s horizon',
			'The y-coordinate of the first post-snip lock rail\'s horizon',
			'The x-coordinate of the second post-snip lock rail\'s start point',
			'The y-coordinate of the second post-snip lock rail\'s start point',
			'The x-coordinate of the second post-snip lock rail\'s horizon',
			'The y-coordinate of the second post-snip lock rail\'s horizon',
			'The start zoom of the pre-snip lock rails',
			'The x-coordinate of the first pre-snip lock rail\'s start point',
			'The y-coordinate of the first pre-snip lock rail\'s start point',
			'The x-coordinate of the first pre-snip lock rail\'s horizon',
			'The y-coordinate of the first pre-snip lock rail\'s horizon',
			'The x-coordinate of the second pre-snip lock rail\'s start point',
			'The y-coordinate of the second pre-snip lock rail\'s start point',
			'The x-coordinate of the second pre-snip lock rail\'s horizon',
			'The y-coordinate of the second pre-snip lock rail\'s horizon',
		], and: {op: '?', multiline: true, and: [
			{op: '>=', and: ['zoom0', 'zoom1']},
			{op: 'array', multiline: 2, and: [
				'zoom0',
				'dMidX0', 'dMidY0',
				'dCX0', 'dCY0',
				{op: '...', and: {op: 'call', id: 'getProgressed', and: ['dMidX1', 'dMidY1', 'dCX1', 'dCY1', 'zoom1', 'zoom0']}},
				'dCX1', 'dCY1',
				'zoom1',
				{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX0', 'dEndY0', 'originZoom0', 'zoom1']}},
				'dEndX0', 'dEndY0',
				'dMidX1', 'dMidY1',
				'dCX1', 'dCY1',
			]},
			{op: 'array', multiline: 2, and: [
				'zoom1',
				{op: '...', and: {op: 'call', id: 'getProgressed', and: ['dMidX0', 'dMidY0', 'dCX0', 'dCY0', 'zoom0', 'zoom1']}},
				'dCX0', 'dCY0',
				'dMidX1', 'dMidY1',
				'dCX1', 'dCY1',
				'zoom0',
				'dMidX0', 'dMidY0',
				'dCX0', 'dCY0',
				{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX1', 'dEndY1', 'originZoom1', 'zoom0']}},
				'dEndX1', 'dEndY1',
			]},
		]}},
		'',
		{op: 'if', and: [
			'match0',
			{op: 'return', and: {op: 'array', multiline: [9], and: [
				'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
				'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: [9], and: [
			'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
			'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
			true,
			{op: '...', and: {op: '?', multiline: true, and: [
				{op: '>=', and: ['originZoom0', 'originZoom1']},
				{op: 'array', and: [
					'originZoom0',
					0, 0,
					'dEndX0', 'dEndY0',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX1', 'dEndY1', 'originZoom1', 'originZoom0']}},
					'dEndX1', 'dEndY1',
				]},
				{op: 'array', and: [
					'originZoom1',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX0', 'dEndY0', 'originZoom0', 'originZoom1']}},
					'dEndX0', 'dEndY0',
					0, 0,
					'dEndX1', 'dEndY1',
				]},
			]}},
		]}},
	]},
	{op: 'func', id: 'getZoom', args: ['flip0', 'flip1'], description: [
		'True if the rails to the top-left image corner should be mirrored',
		'True if the rails to the top-right image corner should be mirrored',
	], type: 'zoom', and: [
		{op: '=', id: 'isInverse', description: 'True for the left and right regions', and: {op: '!=', and: ['flip0', 'flip1']}},
		{op: '=', id: [
			'zoomC', 'fromX0C', 'fromY0C', 'toX0C', 'toY0C', 'fromX1C', 'fromY1C', 'toX1C', 'toY1C',
			'zoomB', 'fromX0B', 'fromY0B', 'toX0B', 'toY0B', 'fromX1B', 'fromY1B', 'toX1B', 'toY1B',
			'hasA', 'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A',
		], description: [
			'The start zoom of the post-snip lock rails',
			'The x-coordinate of the first post-snip lock rail\'s start point',
			'The y-coordinate of the first post-snip lock rail\'s start point',
			'The x-coordinate of the first post-snip lock rail\'s horizon',
			'The y-coordinate of the first post-snip lock rail\'s horizon',
			'The x-coordinate of the second post-snip lock rail\'s start point',
			'The y-coordinate of the second post-snip lock rail\'s start point',
			'The x-coordinate of the second post-snip lock rail\'s horizon',
			'The y-coordinate of the second post-snip lock rail\'s horizon',
			'The start zoom of the pre-snip lock rails',
			'The x-coordinate of the first pre-snip lock rail\'s start point',
			'The y-coordinate of the first pre-snip lock rail\'s start point',
			'The x-coordinate of the first pre-snip lock rail\'s horizon',
			'The y-coordinate of the first pre-snip lock rail\'s horizon',
			'The x-coordinate of the second pre-snip lock rail\'s start point',
			'The y-coordinate of the second pre-snip lock rail\'s start point',
			'The x-coordinate of the second pre-snip lock rail\'s horizon',
			'The y-coordinate of the second pre-snip lock rail\'s horizon',
			'True if the post-snip origin rails should be checked',
			'The start zoom of the post-snip origin rails',
			'The x-coordinate of the first post-snip origin rail\'s start point',
			'The y-coordinate of the first post-snip origin rail\'s start point',
			'The x-coordinate of the first post-snip origin rail\'s horizon',
			'The y-coordinate of the first post-snip origin rail\'s horizon',
			'The x-coordinate of the second post-snip origin rail\'s start point',
			'The y-coordinate of the second post-snip origin rail\'s start point',
			'The x-coordinate of the second post-snip origin rail\'s horizon',
			'The y-coordinate of the second post-snip origin rail\'s horizon',
		], and: {
			op: 'call', id: 'getPairings',
		}},
		'',
		{op: '=', id: 'snapC', description: 'The snap zoom if the snap point is between the pair of post-snip lock rails — otherwise NaN', and: {
			op: 'call', id: 'getIntersectZoom', and: [
				'zoomC', 'fromX0C', 'fromY0C', 'toX0C', 'toY0C', 'fromX1C', 'fromY1C', 'toX1C', 'toY1C', 1,
			],
		}},
		'',
		{op: 'if', and: [
			'snapC',
			{op: 'return', and: 'snapC'},
		]},
		'',
		{op: '=', id: 'snapB', description: 'The snap zoom if the snap point is between the pair of pre-snip lock rails — otherwise NaN', and: {
			op: 'call', id: 'getIntersectZoom', and: [
				'zoomB', 'fromX0B', 'fromY0B', 'toX0B', 'toY0B', 'fromX1B', 'fromY1B', 'toX1B', 'toY1B', {
					op: '-', and: [1, {op: '/', and: ['zoomB', 'zoomC']}],
				},
			],
		}},
		'',
		{op: 'if', and: [
			{op: '||', and: [{op: '!', and: 'hasA'}, 'snapB']},
			{op: 'return', and: 'snapB'},
		]},
		'',
		{op: 'return', and: {
			op: 'call', id: 'getIntersectZoom', and: [
				'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A', {
					op: '-', and: [1, {op: '/', and: ['zoomA', 'zoomB']}],
				},
			],
		}},
	]},
];
