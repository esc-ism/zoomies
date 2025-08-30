import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	wrapper.append(
		demo.element,
		getText(
			{
				tag: 'h1',
				content: 'Triple-Line Rotation',
				style: {textAlign: 'center'},
			},
			'So 1 line doesn\'t work too well, 2 lines has issues... how about 3 lines?!',
			[
				'We can solve the 2-line panning issue by always using the preferred axis line, but adding a connector to the corner line.',
				'In this system, the connecting line keeps two image corners on the viewport\'s edge.',
				'It achieves this by starting as soon as an image corner would become unobservable and travelling directly towards a viewport corner.',
			],
			[
				'It\'s possible for corner lines to intersect with an axis line rather than the connector.',
				'In these instances, the axis line and the connector will have the same start zoom.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'This system\'s best-case is slightly inferior to that of the prior system, with fewer opportunities to take optimal panning paths.',
				'Its worse-case, on the other hand, is leagues ahead, always expanding bounds sensibly and excelling on extreme aspect ratios.',
				'Its consistency also facilitates more fluid changes to bounds.',
				'This fluidity does falter when image and viewport aspect ratios are both around 1:1, but choppiness here is far less noticeable than in the prior system.',
			],
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Snap-Pan Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'This system is no worse nor better at snap-panning than the prior.',
				'If you try a snap-pan here and then hit your left arrow key, you\'ll see that differences are negligible.',
				'If we\'re picking nits, however, the choppiness of the prior system\'s pan limits do lead to some slight inconsistency in span pans.',
				'This system has much less of that inconsistency.',
				'The only other objective difference is that this one has less efficient code.',
			],
			'The balance of consistency and efficiency must be weighed to judge a victor.',
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'I think that the system could be improved to further reduce this choppiness.',
				'This may come at the cost of increased complexity, but it may also be my own unnecessary complications that keep the system from its ideal form.',
				'This is the system that I\'m least confident is perfectly described by its code, making it the most promising prospect for improvements to both behaviour and efficiency.',
			],
			[
				'Despite my misgivings, I think this is close to a flawless system.',
				'Like I mentioned at the start of our rotation odyssey, however, it\'s much harder to identify "perfect" behaviour here than with the earlier systems.',
				'No doubt a different approach could produce a better system, but finding that approach is beyond my current capabilities.',
			],
			[
				'In handling rotation, we sacrifice code efficiency and intuitive bounds relative to those "perfect" systems.',
				'To reiterate, I recommend using the "Viewport Center" system for pan-limiting, since it\'s unbeatable on those two fronts.',
				'Furthermore, the difference between this system and the prior as a snap-pan facilitator is negligible;',
				'If pan-limiting isn\'t a concern, both have valid candidacy for implementation.',
			],
			[
				'Although the use cases for my more complex work are limited, I\'m glad to have done it.',
				'This all started from an idea for a userscript and a feeling that I ',
				{
					tag: 'i',
					content: 'should',
				},
				' be able to code it.',
				'From there, my obsessive, self-injurious drive blew this project\'s scope way beyond what was sensible.',
				'Still, having broke the surface of this abyss, I\'m proud to have pushed my limits so far.',
			],
		),
	);
	
	return demo;
};
