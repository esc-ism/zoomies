import Demo from './demo';

import {DEGREES, ERROR_ALLOWANCE} from '@/shared';
import {getText, getCode, getButton} from '../../shared';

export const badTweens = {
	ratio: 0.6,
	position: 0.5,
	rotation: -4.467,
	zoom: 2,
};

const getSub = (content) => ({tag: 'sub', content});

export default (wrapper) => {
	const demo = new Demo();
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h1',
				content: 'Naive Rotation',
				style: {textAlign: 'center'},
			},
			[
				'Now that we\'re considering rotation, how exactly do we want our system to behave?',
				'There are many approaches, some more effective than others.',
				'Here, I\'ll again start with the most simple.',
			],
			[
				'This demo has pan-limit points travel from the image\'s center directly towards their corresponding corners.',
				'Again, corners are kept at the edge of the viewport where possible.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'The maths here aren\'t yet too esoteric.',
				'First, I calculate the maximum zoom at which corners are visible from the origin.',
				'Adjacent corners can have different values but opposite corners are always equivalent.',
				'Knowing this, I only need to calculate a zoom for the top-left and top-right corners.',
			],
			getCode(
				['theta = tan', {tag: 'sup', content: '-1'}, '(imageHeight ÷ imageWidth)'],
				'',
				'topLeftAngle = rotation - (theta - π ÷ 2)',
				'topRightAngle = rotation + (theta - π ÷ 2)',
				'',
				['distance = 0.5 × √(imageWidth', {tag: 'sup', content: '2'}, ' + imageHeight', {tag: 'sup', content: '2'}, ')'],
				'',
				'topLeftX = distance × cos(topLeftAngle)',
				'topLeftY = distance × sin(topLeftAngle)',
				'',
				'topRightX = distance × cos(topRightAngle)',
				'topRightY = distance × sin(topRightAngle)',
				'',
				'topLeftZoom = 0.5 ÷ max(|topLeftX| ÷ viewportWidth, |topLeftY| ÷ viewportHeight)',
				'topRightZoom = 0.5 ÷ max(|topRightX| ÷ viewportWidth, |topRightY| ÷ viewportHeight)',
			),
			[
				'Given these zoom values, we can derive pan limits from the user\'s zoom level.',
			],
			getCode(
				'function getBound(corner, cornerZoom):',
				'  if zoom ⩽ cornerZoom:',
				'    return {x: 0, y: 0}',
				'',
				'  progress = zoom ÷ cornerZoom',
				'',
				'  return {',
				'    x: corner.x - corner.x ÷ progress,',
				'    y: corner.y - corner.y ÷ progress',
				'  }',
				'',
				'topLeftBound = getBound({x: -0.5, y: 0.5}, topLeftZoom)',
				'topRightBound = getBound({x: 0.5, y: 0.5}, topRightZoom)',
				'',
				'bottomLeftBound = {x: -topRightBound.x, y: -topRightBound.y}',
				'bottomRightBound = {x: -topLeftBound.x, y: -topLeftBound.y}',
			),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'You\'ll find that this system works ',
				getButton('perfectly', demo, [
					() => [{ratio: demo.ratioViewport, position: {x: -0.5, y: 0.5}}],
					() => [{rotation: demo.rotation - DEGREES[180] + ERROR_ALLOWANCE}, {duration: 4}],
					() => [{zoom: demo.zoom * 2}, {duration: 2, ease: 'power3.inOut', yoyo: true, repeat: 1, position: '<'}],
				]),
				' if the viewport and image share an aspect ratio.',
				'The system\'s flaw is only revealed when the ratios are ',
				getButton('decoupled', demo, [[{ratio: badTweens.ratio}]]),
				'.',
			],
			[
				'Consider ',
				getButton('this', demo, [[badTweens]]),
				' demo state.',
				'Imagine that you want to see the entirety of the image\'s top-right corner.',
				'You\'ll find that it\'s ',
				getButton('impossible', demo, [
					[badTweens],
					[{position: {x: 0.5, y: 0.1}}],
				]),
				' to achieve this without ',
				getButton('rotating', demo, [
					[badTweens],
					[{rotation: Math.round(badTweens.rotation / DEGREES[90]) * DEGREES[90]}],
				]),
				' or ',
				getButton('zooming', demo, [
					[badTweens],
					[{zoom: 1}],
				]),
				' out past the point that pan limits become one-dimensional.',
			],
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			[
				'The maths for snap panning will take a little longer to run though.',
				'First, I split the image into four segments using lines from the origin to each corner.',
				'The snap position will fall into one of these segments; I disregard the two lines that don\'t contribute to the position\'s segment.',
				'If the zoom value that I\'ve calculated for one of the relevant corners is lower than the other, I snip off the start of its line.',
			],
			getCode(
				'proportion = 1 - lowZoom ÷ highZoom',
				'',
				'snippedStart = {',
				'  x: proportion × corner.x,',
				'  y: proportion × corner.y',
				'}',
			),
			[
				'This snip makes the line begin on its corner\'s bound at the other corner\'s zoom.',
				'From here, I need to find a line that intersects the snap point and ',
				{
					tag: 'a',
					href: 'https://math.stackexchange.com/questions/2223691/intersect-2-lines-at-the-same-ratio-through-a-point',
					content: 'both lines at the same ratio',
				},
				'.',
				'Solving this requires the ',
				{
					tag: 'a',
					href: 'https://en.wikipedia.org/wiki/Linear_interpolation',
					content: 'linear interpolation',
				},
				' formula, replacing slope with a variable (r) to be solved.',
			],
			getCode(
				['x', getSub('r'), ' = x', getSub('0'), ' + r × (x', getSub('1'), ' - x', getSub('0'), ')'],
				['y', getSub('r'), ' = y', getSub('0'), ' + r × (y', getSub('1'), ' - y', getSub('0'), ')'],
			),
			[
				'We can use the point as a seperator, splitting the intersecting line into two smaller lines.',
				'Knowing that these sub-lines must share a gradient, we can use ',
				{tag: 'span', content: '"m = dY / dX"', style: {whiteSpace: 'nowrap'}},
				' to write the equation we\'re trying to solve.',
				'For the two lines that form the snap point\'s segment, I\'ll label the first line as follows:',
			],
			'bottomY = a, topY = b, bottomX = c, topX = d, interpolatedY = rA, interpolatedX = rB',
			'and the second line as:',
			'bottomY = e, topY = f, bottomX = g, topX = h, interpolatedY = rC, interpolatedX = rD',
			getCode(
				'm = (rA - y) ÷ (rB - x)',
				'  = (rC - y) ÷ (rD - x)',
				'',
				'  (a + r × (b - a) - y) ÷ (c + r × (d - c) - x)',
				'= (e + r × (f - e) - y) ÷ (g + r × (h - g) - x)',
				'',
				'...',
				'',
				['  r', {tag: 'sup', content: 2}, ' × (bh - bg - ah + ag - dg + cd + de - ce)'],
				'+ r × (bg - bx - 2ag + ax + ah - hy + gy - cf + fx + ce - ex - de + ce + dy - cy)',
				'+ (ag - ax - gy - ce + ex + cy)',
				'= 0',
			),
			[
				'We end up with a quadratic expression and solve it with the ',
				{tag: 'a', content: 'quadratic formula', href: 'https://en.wikipedia.org/wiki/Quadratic_formula'},
				' to find our ratio.',
				'From here, it\'s a simple calculation using the highZoom value from earlier to find our final snap zoom.',
			],
			getCode('snapZoom = highZoom / (1 - r)'),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'Okay! So how does the system perform as a medium for snap-panning?',
				'Again, it\'s perfect until we decouple aspect ratios.',
				'Specifically, consider ',
				getButton('this', demo, [
					[{ratio: 0.5, rotation: DEGREES[90], position: 0, zoom: 1}],
					[{y: 0.25, zoom: 2}, {duration: 0}],
				]),
				' snap pan.',
				'It doesn\'t make any sense to show the empty space above the image here. ',
				getButton('Increasing', demo, [
					[{ratio: 0.25, rotation: DEGREES[90], position: {x: 0, y: 0.25}, zoom: 2}],
				]),
				' the differential makes it even less sensible, with empty space appearing below too.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'This laissez-faire approach to pan limit point expansion doesn\'t work.',
				'An improved system will require more deliberate placement of image corners on viewport edges.',
			],
		),
	);
	
	return demo;
};
