import {SVG_NAMESPACE} from '@/shared';

import {getDiagram, COLOURS, getSplit} from '../../../shared/svg';

import {getMirroredLine} from './shared';

const radii = {x: 20, y: 20};
const strokeDiameter = 0.4;
const topLeft = [-radii.x * 0.26, -radii.y];
const topRight = [radii.x, -radii.y * 0.3];

const svg = getDiagram(radii, strokeDiameter, topLeft, topRight);

svg.style.marginLeft = '0.5em';

const POINTS = [
	[[0, 0], ...getSplit([radii.x * 0.113, radii.y * -0.2], topLeft, 0.3)],
	[...getSplit([radii.x * 0.1, radii.y * 0.055], [radii.x * 0.3, radii.y * 0.167], 0.5), topRight],
];

for (let i = 0; i < 3; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke', COLOURS[i]);
	
	group.append(...POINTS.map((points) => getMirroredLine(points[i], points[i + 1])).flat());
	
	svg.appendChild(group);
}

export default svg;
