import {SVG_NAMESPACE} from '@/shared';
import {getProgressed} from '../shared';

const RADIUS = {X: 30, Y: 20};
const DIAMETER = {X: RADIUS.X * 2, Y: RADIUS.Y * 2};
const STROKE_RADIUS = 0.4;
const STROKE_DIAMETER = STROKE_RADIUS * 2;
const TOP_LEFT = [-RADIUS.X * 0.7 - STROKE_RADIUS, -RADIUS.Y - STROKE_RADIUS];
const TOP_RIGHT = [RADIUS.X + STROKE_RADIUS, -RADIUS.Y * 0.3 - STROKE_RADIUS];

const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

svg.setAttribute('viewBox', `${-RADIUS.X - STROKE_RADIUS} ${-RADIUS.Y - STROKE_RADIUS} ${DIAMETER.X + STROKE_DIAMETER} ${DIAMETER.Y + STROKE_DIAMETER}`);
svg.setAttribute('fill', 'none');
svg.setAttribute('stroke', 'black');
// svg.setAttribute('stroke-linecap', 'round');
// svg.setAttribute('stroke-linejoin', 'round');
svg.setAttribute('stroke-width', STROKE_DIAMETER);

svg.style.textAlign = 'center';
svg.style.width = '400px';
svg.style.backgroundColor = '#2f3450';
svg.style.border = '6px solid black';

const getLine = ([x1, y1], [x2, y2]) => {
	const line = document.createElementNS(SVG_NAMESPACE, 'line');
	
	line.setAttribute('x1', x1);
	line.setAttribute('y1', y1);
	line.setAttribute('x2', x2);
	line.setAttribute('y2', y2);
	
	return line;
};

const getMirroredLine = (...points) => [getLine(...points), getLine(...points.map(([x, y]) => [-x, -y]))];

const image = document.createElementNS(SVG_NAMESPACE, 'g');

image.append(
	...getMirroredLine(TOP_LEFT, TOP_RIGHT),
	...getMirroredLine(TOP_RIGHT, TOP_LEFT.map((value) => -value)),
);

const getSplit = (from, to, ratio) => {
	const {x, y} = getProgressed({x: from[0], y: from[1]}, {x: to[0], y: to[1]}, ratio);
	
	return [from, [x, y], to];
};

const POINTS = [
	[[0, 0], ...getSplit([RADIUS.X * 0.04, RADIUS.Y * -0.2], TOP_LEFT, 0.5)],
	[...getSplit([RADIUS.X * 0.2, RADIUS.Y * 0.08], [RADIUS.X * 0.5, RADIUS.Y * 0.22], 0.5), TOP_RIGHT],
];

const colours = ['#374', '#962', '#722'];

for (let i = 0; i < 3; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke-linecap', 'round');
	
	group.setAttribute('stroke', colours[i]);
	
	group.append(...POINTS.map((points) => getMirroredLine(points[i], points[i + 1])).flat());
	
	svg.appendChild(group);
}

svg.append(image);

export default svg;
