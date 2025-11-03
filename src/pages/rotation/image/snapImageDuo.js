import {SVG_NAMESPACE} from '@/shared';
import {getDiagram, getLine, COLOURS} from '@/pages/shared/svg';
import {getProgressed} from '../shared';

const radii = {x: 13, y: 20};
const strokeRadius = 0.4;
const topLeft = [-radii.x * 0.26, -radii.y];
const topRight = [radii.x, -radii.y * 0.77];

const svg = getDiagram(radii, strokeRadius, topLeft, topRight);

svg.style.marginRight = '0.5em';

const getMirroredLine = (...points) => [getLine(...points), getLine(...points.map(([x, y]) => [-x, -y]))];

const getSplit = (from, to, ratio) => {
	const {x, y} = getProgressed({x: from[0], y: from[1]}, {x: to[0], y: to[1]}, ratio);
	
	return [from, [x, y], to];
};

const split = [radii.x * 0.132, radii.y * -0.32];

const POINTS = [
	[split, [radii.x * 0.21, radii.y * -0.5], topLeft],
	getSplit(split, topRight, 0.2),
];

for (let i = 0; i < 2; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke', COLOURS[i]);
	
	group.append(...POINTS.map((points) => getMirroredLine(points[i], points[i + 1])).flat());
	
	svg.appendChild(group);
}

export default svg;
