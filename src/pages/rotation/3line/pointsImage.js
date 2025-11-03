import {SVG_NAMESPACE} from '@/shared';
import {COLOURS, getBorder, getDiagram, getLine, getText} from '@/pages/shared/svg';

const radii = {x: 25, y: 20};
const strokeRadius = 0.4;

const svg = getDiagram(
	radii, strokeRadius,
	[-radii.x * 0.75, -radii.y * 0.85],
	[radii.x, -radii.y * 0.16],
);

const points = [
	[0, -radii.y * 0.87, 1],
	[radii.x * 0.87, 0, 1],
	[-radii.x - strokeRadius, 0, 0],
	[radii.x * 0.87, -radii.y * 0.87, 2],
];

const group = document.createElementNS(SVG_NAMESPACE, 'g');

group.setAttribute('stroke-linecap', 'butt');

for (const point of points) {
	const line = getLine([0, 0], point);
	
	line.setAttribute('stroke', COLOURS[point[2]]);
	
	group.appendChild(line);
}

svg.append(
	getBorder(radii.x * 0.87 + strokeRadius, radii.y * 0.87 + strokeRadius, strokeRadius * 2),
	group,
	getText('A', [0, 0], strokeRadius, -0.2, 0.9),
	getText('B', points[2], strokeRadius, -0.2, -0.9),
	getText('C', points[0], strokeRadius, -0.5, -0.72),
	getText('D', points[1], strokeRadius, 0.2, -0.1),
	getText('E', points[3], strokeRadius, 0.2, -0.5),
);

export default svg;
