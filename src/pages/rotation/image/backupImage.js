import {SVG_NAMESPACE} from '@/shared';
import {COLOURS, getDiagram, getLine, getText} from '@/pages/shared/svg';

const radii = {x: 25, y: 20};
const strokeRadius = 0.4;

const svg = getDiagram(
	radii, strokeRadius,
	[-radii.x * 0.8, -radii.y],
	[radii.x * 1.15, -radii.y * 0.2],
);

const shapes = [
	[
		[0, 0],
		[radii.x * 0.174, -radii.y * 0.6],
	],
	[
		[0, -radii.y],
		[-radii.x * 0.8, -radii.y],
	],
];

const center = [0, -radii.y * 0.67];

for (const [i, points] of shapes.entries()) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke', COLOURS[i]);
	
	group.append(
		getLine(...points),
		getLine(points[1], center),
		getLine(center, points[0]),
	);
	
	svg.appendChild(group);
}

svg.append(
	getText('A', shapes[0][0], strokeRadius, -0.2, 1),
	getText('B', shapes[0][1], strokeRadius, 0.4, 0.2),
	getText('C', center, strokeRadius, -1.3, 0.7),
	getText('D', shapes[1][0], strokeRadius, 0.45, 0.4),
	getText('E', shapes[1][1], strokeRadius, -1.2, 0.7),
);

export default svg;
