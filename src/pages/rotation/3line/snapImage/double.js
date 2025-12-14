import {SVG_NAMESPACE} from '@/shared';

import {getDiagram, COLOURS, getSplit} from '../../../shared/svg';

import {getMirroredLine} from '../../shared/doubleImage';

const radii = {x: 13, y: 20};
const strokeDiameter = 0.4;
const topLeft = [-radii.x * 0.26, -radii.y];
const topRight = [radii.x, -radii.y * 0.77];

const svg = getDiagram(radii, strokeDiameter, topLeft, topRight);

svg.style.marginRight = '0.5em';

const split = [radii.x * 0.232, radii.y * -0.32];

const POINTS = [
	[split, [radii.x * 0.43, radii.y * -0.5], topRight],
	getSplit(split, topLeft, 0.24),
];

for (let i = 0; i < 2; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke', COLOURS[i + 1]);
	
	group.append(...POINTS.map((points) => getMirroredLine(points[i], points[i + 1])).flat());
	
	svg.appendChild(group);
}

export default svg;
