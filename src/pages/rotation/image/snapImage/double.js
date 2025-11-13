import {SVG_NAMESPACE} from '@/shared';

import {getDiagram, COLOURS, getSplit} from '../../../shared/svg';

import {getMirroredLine} from './shared';

const radii = {x: 13, y: 20};
const strokeRadius = 0.4;
const topLeft = [-radii.x * 0.26, -radii.y];
const topRight = [radii.x, -radii.y * 0.77];

const svg = getDiagram(radii, strokeRadius, topLeft, topRight);

svg.style.marginRight = '0.5em';

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
