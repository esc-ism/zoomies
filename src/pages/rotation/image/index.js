import {DEGREES} from '@/shared';
import {getText, getCode, getButton, registerDemo} from '../../shared';
import {register as registerFunctions} from '../../code';
import * as mock from '../mock';
import {permissiveTweens, restrictiveTweens} from '../1line';

import snapImage from './snapImage';
import Demo from './demo';
import getZoomPoints from './zoomPoints';

const getCornerProgressTweens = (rotation) => [
	[{ratio: 1, zoom: 1, position: 0.5}],
	[{rotation}, {delay: 0.2}],
];

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

export default (wrapper) => {
	const demo = new Demo();
	
	const getTraceVars = getVarGetter(demo, DEGREES[90] - 0.4, 0.75);
	
	registerDemo(demo);
	// registerFunctions(demo, functions);
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				tag: 'h1',
				content: 'Double-Line Rotation',
				style: {textAlign: 'center'},
			},
			[
				'In the prior system, there were two playground states that revealed issues.',
				'Let\'s start by seeing how they look here.',
			],
			[
				'In the prior system, there were two playground states that revealed issues.',
				'Let\'s start by seeing how they look here.',
			],
			[
				'First, the ',
				getButton('state', [[restrictiveTweens]]),
				' that was too restrictive is way better!',
				'It isn\'t nearly as permissive as the "Viewport Center" system, but in most situations it\'s good enough.',
				'The unnecessarily permissive ',
				getButton('state', [[permissiveTweens]]),
				' is also fixed, accurately replicating the behaviour of the "Viewport Edge" system.',
			],
			[
				'In the "Single-Line" system, we had no control over rail gradients; they would always be 1 or -1.',
				'This kept us from choosing lock points.',
				'Multi-line rails allow us to choose whatever gradients we want, providing much more flexibility.',
			],
			[
				'This system places each lock point on a different viewport edge.',
				'A point\'s distance along its edge is based on rotation angle.',
				'For example, it lies on the expected viewport corners at ',
				getButton('0°', getCornerProgressTweens(DEGREES[90])),
				' and ',
				getButton('90°', getCornerProgressTweens(0)),
				' and travels linearly between them for ',
				getButton('intermediate angles', [
					...getCornerProgressTweens(DEGREES[90]),
					[{rotation: 0}, {ease: 'none', duration: 3}],
				]),
				'.',
			],
			[
				'Now that we\'re messing with rail gradients, we need another rail segment to connect back to the origin.',
				'I\'ll call rail segments that determine lock points "lock rails" and the other segments "origin rails".',
			],
			[
				'In this system, ',
				getButton('origin rails', [
					({rotation, ratio, first}) => [{position: 0, ratio, rotation, zoom: first.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'  follow image axes until they intersect ',
				getButton('lock rails', [
					({rotation, ratio, second}) => [{position: second, ratio, rotation, zoom: second.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z * 2}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'Each lock point must be on a different viewport edge, and adjacent corners will have lock points on adjacent edges.',
				'Since we\'re focusing on the top-left and top-right image corners, we can say that one will be a "side" (left or right viewport edge) corner and the other a "base" (top or bottom viewport edge) corner.',
				'This assignment will be based off rotation, with corners alternating between "base" and "side" every 90°.',
			],
			[
				'Each origin rail\'s start zoom will be the zoom at which its image corner touches a viewport edge.',
				'If we know the lock rail\'s gradient, and we know which image corner it will end at, we can derive its start zoom from its origin rail intersection.',
			],
			[
				'Whichever origin rail direction minimises lock rail length is preferred.',
				'If a direction gives an intersect with a y coordinate over 0.5, it\'s disqualified.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'The maths here build upon those of the single-line system.',
				'As before, a lock rail is snipped to achieve matching start zooms.',
				'Now, however, the snipped part of the lock rail must be paired with the end of the un-snipped lock rail\'s origin rail.',
				'Finally, one more snip is necessary to match zooms for origin rails.',
				'The final product might look similar to the image below.',
			],
			{
				tag: 'div',
				content: snapImage,
				style: {textAlign: 'center'},
			},
			[
				'In the prior system, I needed to find a line that intersects the snap point and two adjacent rails.',
				'Now, with the adjacent rails split into a trio of segment pairs, the number of checks required to find a snap zoom is tripled.',
			],
			
		),
	);
	
	return demo;
};
