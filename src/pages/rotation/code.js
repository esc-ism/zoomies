export default [
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
