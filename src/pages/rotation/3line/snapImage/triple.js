import {SVG_NAMESPACE} from '@/shared';

import {getDiagram, COLOURS, getSplit} from '../../../shared/svg';

import {getMirroredLine} from '../../shared/doubleImage';

const radii = {x: 20, y: 20};
const strokeDiameter = 0.4;
const topLeft = [-radii.x * 0.26, -radii.y];
const topRight = [radii.x, -radii.y * 0.3];

const svg = getDiagram(radii, strokeDiameter, topLeft, topRight);

svg.style.marginLeft = '0.5em';

const POINTS = [
	[...getSplit([0, radii.y * -0.1], [radii.x * 0.113, radii.y * -0.21], 0.5), topLeft],
	[[0, radii.y * 0.1], ...getSplit([radii.x * 0.04, radii.y * 0.15], topRight, 0.1)],
];

for (let i = 0; i < 3; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke', COLOURS[i]);
	
	group.append(...POINTS.map((points) => getMirroredLine(points[i], points[i + 1])).flat());
	
	svg.appendChild(group);
}

export default svg;
