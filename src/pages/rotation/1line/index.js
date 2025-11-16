import demo from '@/demo';
import {DEGREES} from '@/shared';
import {isVertical} from '@/shared/orientation';

import {cleanup, register as registerFunctions} from '../../code';
import {getText, getCode, getInstruction, getInputDependent, getMath, getDiagrammedMath} from '../../shared';
import {getButton, clearButton} from '../../shared/button';
import {xmlns, opSpace, getOverlined} from '../../shared/math';
import {CLASS_MATH_ASSERTION, CLASS_MATH_EQUATION, TWEEN_OPTIONS_YOYO} from '../../consts';

import SHARED_FUNCTIONS from '../code';
import * as mock from '../mock';

import System, {getBound, getZoomPoints} from './demo';
import zoomImage from './zoomImage';
import snapImage from './snapImage';

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const code = [];

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

let getLockVars;

export default {
	System,
	start() {
		getLockVars = getVarGetter(-DEGREES[270] + 0.5, 0.6);
		
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
			content: 'Single-Line Rotation',
			style: {textAlign: 'center'},
		},
		[
			'This is the simplest possible zoomful system that can handle image rotation.',
			'The rail to each image corner is a direct, single line (hence the page\'s title) from the image\'s origin.',
		],
		{
			tag: 'h2',
			content: 'Pan-Limit Maths',
			style: {textAlign: 'center'},
		},
		[
			'A rail\'s "start zoom" is the zoom at which bounds ',
			getButton('start progressing', [
				(zoom) => [{zoom, position: 0}],
				(zoom) => [{zoom: zoom * 1.05}, TWEEN_OPTIONS_YOYO],
			], {
				getParam: () => {
					const {zoomPoints} = demo.system;
					
					return zoomPoints[zoomPoints[0].z < zoomPoints[1].z ? 0 : 1].z;
				},
			}),
			' along it.',
			'To assign start zooms, we need to find the maximum zoom at which image corners are visible from the origin.',
			'Adjacent rails can differ, but opposite rails always share a start zoom.',
			'Knowing this, only the top-left and top-right corners need be considered.',
		],
		[
			'For a given corner, there are two possible start zooms —',
			'one if the corner disappears off the ',
			getButton('"side"', [
				[{rotation: DEGREES[90], ratio: 0.5, zoom: 1, position: 0}],
				[{zoom: 1.05}, TWEEN_OPTIONS_YOYO],
			]),
			' (left/right) of the viewport, and another if it disappears off its ',
			getButton('"base"', [
				[{rotation: DEGREES[90], ratio: 2, zoom: 1, position: 0}],
				[{zoom: 1.05}, TWEEN_OPTIONS_YOYO],
			]),
			' (top/bottom).',
			'I find both zooms and disregard whichever\'s larger.',
		],
		[
			'Finding the start zooms requires some trigonometry.',
			'We need to find the viewport sizes at which its edges might contact the image corner.',
			'A solution is given below, using the top-left image corner as an example.',
		],
		getInstruction([
			[
				'If maths depend on a diagram, scrolling close enough will make the diagram appear.',
				'You may have noticed the little white ', {tag: 'span', style: {fontSize: '0.77em'/* borderWidth * 1.54 */}, content: '◤'}, ' to the left.',
				'This is one of three threshold indicators.',
				'Scroll it off the top of the screen to see the diagram.',
			],
			{callback: (element) => {
				const {viewport} = demo.elements;
				
				demo.hooks.resizeViewport.add(() => {
					const property = isVertical() ? 'Height' : 'Width';
					
					if (viewport[`client${property}`] < window[`inner${property}`] / 10) {
						element.innerText = 'The diagram replaces the playground, so you may have to do some resizing to see it.';
					} else {
						element.innerText = '';
					}
				}, true);
			}},
			[
				getInputDependent((isMouse) => isMouse ? 'Click' : 'Tap'),
				' diagrams to center their maths.',
			],
		]),
		getDiagrammedMath(
			zoomImage,
			{
				title: 'Variables',
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_ASSERTION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the viewport side start zoom be '},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'z'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the viewport base start zoom be '},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'z'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let half of the image\'s width be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let half of the image\'s height be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let half of the viewport\'s width at default zoom be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'v'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let half of the viewport\'s height at default zoom be'},
							]},
							{tag: 'mtd', xmlns, content: [
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
								{tag: 'mi', xmlns, content: 'B'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mo', xmlns, content: '-'},
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
								{tag: 'mi', xmlns, content: 'D'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mn', xmlns, content: '0'},
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
								{tag: 'mo', xmlns, content: '|'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'C'},
								{tag: 'mo', xmlns, content: '|'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'z'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
									]},
								]},
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
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'z'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
									]},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: [
					{tag: 'mo', xmlns, content: '∠'},
					{tag: 'mi', xmlns, content: 'B'},
					{tag: 'mi', xmlns, content: 'A'},
					{tag: 'mi', xmlns, content: 'C'},
				],
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '∠'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'D'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mi', xmlns, content: 'D'},
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
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '∠'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'D'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msup', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
									{tag: 'mn', xmlns, content: '-1'},
								]},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
									]},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '∠'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '∠'},
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'D'},
									]},
									{tag: 'mo', xmlns, content: '-'},
									{tag: 'mi', xmlns, content: 'θ'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msup', xmlns, content: [
											{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
											{tag: 'mn', xmlns, content: '-1'},
										]},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'mfrac', xmlns, content: [
											{tag: 'mrow', xmlns, content: [
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'i'},
													{tag: 'mi', xmlns, content: 'w'},
												]},
											]},
											{tag: 'mrow', xmlns, content: [
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'i'},
													{tag: 'mi', xmlns, content: 'h'},
												]},
											]},
										]},
										{tag: 'mo', xmlns, content: ')'},
									]},
									{tag: 'mo', xmlns, content: '-'},
									{tag: 'mi', xmlns, content: 'θ'},
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
					{tag: 'mi', xmlns, content: 'B'},
					{tag: 'mo', xmlns, content: '|'},
				],
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '|'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'B'},
								{tag: 'mo', xmlns, content: '|'},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msqrt', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msup', xmlns, content: [
											{tag: 'mrow', xmlns, content: [
												{tag: 'mo', xmlns, content: '|'},
												{tag: 'mi', xmlns, content: 'A'},
												{tag: 'mi', xmlns, content: 'D'},
												{tag: 'mo', xmlns, content: '|'},
											]},
											{tag: 'mn', xmlns, content: '2'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'msup', xmlns, content: [
											{tag: 'row', xmlns, content: [
												{tag: 'mo', xmlns, content: '|'},
												{tag: 'mi', xmlns, content: 'B'},
												{tag: 'mi', xmlns, content: 'D'},
												{tag: 'mo', xmlns, content: '|'},
											]},
											{tag: 'mn', xmlns, content: '2'},
										]},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msqrt', xmlns, content: [
									{tag: 'msup', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
										{tag: 'mn', xmlns, content: '2'},
									]},
									{tag: 'mo', xmlns, content: '+'},
									{tag: 'msup', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
										{tag: 'mn', xmlns, content: '2'},
									]},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: {tag: 'msub', xmlns, content: [
					{tag: 'mi', xmlns, content: 'z'},
					{tag: 'mi', xmlns, content: 'x'},
				]},
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'sin'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mo', xmlns, content: '∠'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
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
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mo', xmlns, content: '×'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'sin'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mo', xmlns, content: '∠'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: ')'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'z'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'z'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '|'},
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'B'},
											{tag: 'mo', xmlns, content: '|'},
										]},
										{tag: 'mo', xmlns, content: '×'},
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'sin'},
											{tag: 'mo', xmlns, content: '('},
											{tag: 'mo', xmlns, content: '∠'},
											{tag: 'mi', xmlns, content: 'B'},
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mo', xmlns, content: ')'},
										]},
									]},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: {tag: 'msub', xmlns, content: [
					{tag: 'mi', xmlns, content: 'z'},
					{tag: 'mi', xmlns, content: 'y'},
				]},
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
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
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'A'},
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
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mo', xmlns, content: '×'},
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
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'z'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'z'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'v'},
											{tag: 'mi', xmlns, content: 'h'},
										]},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '|'},
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'B'},
											{tag: 'mo', xmlns, content: '|'},
										]},
										{tag: 'mo', xmlns, content: '×'},
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
							]},
						]},
					]},
				],
			},
		),
		[
			'Here it is implemented as a code snippet:',
		],
		getInstruction([
			'This code snippet includes custom functions. ',
			getInputDependent((isMouse) => `${isMouse ? 'Click' : 'Tap'} "getStartZooms" to unfold it and ${isMouse ? 'click' : 'tap'} the "function" text to re-fold.`),
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
		getCode(code, [
			{op: '=', id: ['topLeftZoom', 'topRightZoom'], and: {
				op: 'call', id: 'getStartZooms',
			}},
		]),
		[
			'Given these zoom values, deriving pan-limits is straightforward.',
			'The calculation is demonstrated below.',
		],
		getCode(code, [
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
			' out past the point that pan-limits become one-dimensional.',
		],
		[
			'A consequence of using single-line rails is that image corners get ',
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
			], {getParam: () => getLockVars()}),
			' to the position on the viewport\'s rim that they first contact.',
			'I\'ll refer to this as the corner\'s "lock point".',
			'The corner visibility issue is a problem for any rotated state with a lock point close to a viewport corner.',
		],
		[
			'When struggling to see a corner, the system is too restrictive.',
			'At other times, however, it isn\'t restrictive enough!',
			'In ',
			getButton('this', [[permissiveTweens]]),
			' state, for example, pans along the y-axis shouldn\'t be allowed.',
			'This is a fundamental limitation of single-line rails; it\'s impossible to allow pans along only one axis.',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'The maths for snap-panning will take a little longer to run through.',
			'The image positions used as snap-pan targets will be referred to as "snap points".',
		],
		[
			'The image is split into four "regions" by its rails.',
			'The first step in finding a snap zoom is to find the region that the snap point lies within.',
			'Specifically, we need to know which image corners enclose the region, alongside the origin.',
		],
		getCode(code, [
			{op: '=', id: ['toX0', 'toY0', 'toX1', 'toY1'], and: {
				op: 'call', id: 'getCorners',
			}},
		]),
		[
			'The next step is to define two rails with matching start zooms that border the region.',
			'For this, we take the existing rails and trim the one with a ',
			getButton('lower', [
				({zoomPoints, rotation, ratio}) => [{position: 0, zoom: zoomPoints[0].z, ratio, rotation}],
				({zoomPoints}) => [{zoom: zoomPoints[1].z}, TWEEN_OPTIONS_YOYO],
			], {
				getParam: () => demo.ratioViewport < 1 ?
						getVarGetter(DEGREES[90] - 0.5, 0.5)() :
						getVarGetter(-DEGREES[270] + 0.5, 2)(),
			}),
			' start zoom.',
		],
		getCode(code, [
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
			'The final step is to find some fraction "', {tag: 'i', content: 't'}, '" of rail length such that a line through both rails at ', {tag: 'i', content: 't'}, ' also passes through the snap point.',
			'A kindred spirit gives a more detailed description of the problem ',
			{
				tag: 'a',
				href: 'https://math.stackexchange.com/questions/2223691/intersect-2-lines-at-the-same-ratio-through-a-point',
				content: 'here',
			},
			', including an excellent diagram that you may find helpful.',
		],
		[
			'We can write out a definition of rail points at ', {tag: 'i', content: 't'}, ' using ',
			{
				tag: 'a',
				href: 'https://en.wikipedia.org/wiki/Linear_interpolation#Programming_language_support',
				content: 'linear interpolation',
			},
			'.',
		],
		getMath({content: [
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
		]}),
		[
			'Formalising the "line through both rails at ', {tag: 'i', content: 't'}, '" requires it to be defined as two parallel lines — one for each rail.',
			'Each passes through the snap point and intersects its rail at some ', {tag: 'i', content: 't'}, '.',
			'Knowing that parallel lines share a gradient, we can use ',
			{tag: 'span', content: 'm = dY / dX', style: {whiteSpace: 'nowrap'}},
			' to write an equation to solve for ', {tag: 'i', content: 't'}, '.',
		],
		getDiagrammedMath(
			snapImage,
			{
				title: 'Declarations',
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mtext', xmlns, style: {whiteSpace: 'pre'}, content: ', '},
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'the snap point'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								getOverlined('EF'),
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'the target line'},
							]},
						]},
					]},
				],
			},
			{
				title: {tag: 'mi', xmlns, content: 'Parallel'},
				content: [
					{tag: 'mtable', xmlns, content: [{tag: 'mtr', xmlns, content: [
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
					]}]},
				],
			},
			{
				title: 'Linear Interpolation',
				content: [
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
				],
			},
			{
				title: {tag: 'mi', xmlns, content: 't'},
				content: [
					{tag: 'mtable', xmlns, content: [
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
					{tag: 'div', content: '...'},
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
				],
			},
		),
		[
			'We end up with a quadratic expression and solve it with the ',
			{tag: 'a', content: 'quadratic formula', href: 'https://en.wikipedia.org/wiki/Quadratic_formula'},
			' to find ', {tag: 'i', content: 't'}, '.',
			'From here, it\'s a simple calculation using the un-snipped rail\'s start zoom to find our final snap zoom.',
		],
		getCode(code, [
			{op: '=', id: 't', and: {
				op: 'call', id: 'getT', multiline: [4, 4, 1], and: [
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
						't',
					]},
				],
			}},
		]),
		{
			tag: 'h2',
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		'Okay! Now that we\'ve gone through how snap-panning works, how useful is it in practise?',
		[
			'Like with pan-limiting, it works perfectly until we decouple aspect ratios.',
			'Being too restrictive isn\'t as much of an issue here, but being too permissive isn\'t ideal.',
			'Consider ',
			getButton('this', [
				[{ratio: 0.5, rotation: DEGREES[90], position: 0, zoom: 1}],
				[{y: 0.25, zoom: 2}, {duration: 0}],
			]),
			' snap-pan.',
			'Not zooming in enough to hide the empty space above the image doesn\'t make much sense.',
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
			'Single-line rails don\'t fulfill my needs; pan-limits can be too restrictive or too permissive,',
			'and the prior system\'s behaviour for un-rotated images isn\'t reliable reproduced.',
		],
		[
			'Notably, however, these problems only apply when the image and viewport have different aspect ratios.',
			'Oftentimes, viewports will be sized to exactly match their contents.',
			'When said contents can be rotated, this system has a valid use case.',
		],
	),
};
