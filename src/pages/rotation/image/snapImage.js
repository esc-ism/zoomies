import {SVG_NAMESPACE} from '@/shared';
import {getDiagram, getLine, COLOURS} from '@/pages/shared/svg';
import {getProgressed} from '../shared';

const radii = {x: 30, y: 20};
const strokeRadius = 0.4;
const topLeft = [-radii.x * 0.7 - strokeRadius, -radii.y - strokeRadius];
const topRight = [radii.x + strokeRadius, -radii.y * 0.3 - strokeRadius];

const svg = getDiagram(radii, strokeRadius, topLeft, topRight);

const getMirroredLine = (...points) => [getLine(...points), getLine(...points.map(([x, y]) => [-x, -y]))];

const getSplit = (from, to, ratio) => {
	const {x, y} = getProgressed({x: from[0], y: from[1]}, {x: to[0], y: to[1]}, ratio);
	
	return [from, [x, y], to];
};

const POINTS = [
	[[0, 0], ...getSplit([radii.x * 0.045, radii.y * -0.2], topLeft, 0.5)],
	[...getSplit([radii.x * 0.2, radii.y * 0.08], [radii.x * 0.5, radii.y * 0.2], 0.5), topRight],
];

for (let i = 0; i < 3; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke', COLOURS[i]);
	
	group.append(...POINTS.map((points) => getMirroredLine(points[i], points[i + 1])).flat());
	
	svg.appendChild(group);
}

export default svg;
