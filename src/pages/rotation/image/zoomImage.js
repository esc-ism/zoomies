import {COLOURS, getDiagram, getLine, getText} from '@/pages/shared/svg';
import {SVG_NAMESPACE} from '@/shared';

const radii = {x: 20, y: 20};
const strokeRadius = 0.4;

const svg = getDiagram(
	radii, strokeRadius,
	[-radii.x * 1.7, -radii.y * 0.2],
	[radii.x * 0.8, -radii.y * 1.5],
	`translate(${radii.x * -0.4}, ${radii.y * 0.5})`,
);

const points = [
	[0, radii.y * 0.29, 0],
	[-radii.x * 0.43, radii.y * -0.57, 0],
	[radii.x * 0.4, -radii.y + strokeRadius, 2],
	[0, radii.y * 0.29, 1],
	[strokeRadius, -radii.y + strokeRadius, 1],
	[radii.x * 0.4, -radii.y + strokeRadius],
];

const groups = [
	document.createElementNS(SVG_NAMESPACE, 'g'),
	document.createElementNS(SVG_NAMESPACE, 'g'),
];

groups[0].setAttribute('stroke', COLOURS[0]);
groups[1].setAttribute('stroke', COLOURS[1]);

const dasharray = strokeRadius * 7.2;

for (let i = 0; i < points.length - 1; ++i) {
	if (points[i][2] < 2) {
		groups[points[i][2]].appendChild(getLine(points[i], points[i + 1]));
	} else {
		const line0 = getLine(points[i], points[i + 1]);
		
		line0.setAttribute('stroke-dasharray', dasharray);
		line0.setAttribute('stroke-linecap', 'butt');
		
		const line1 = line0.cloneNode();
		
		line1.setAttribute('stroke-dashoffset', dasharray);
		
		groups[0].appendChild(line0);
		groups[1].appendChild(line1);
	}
}

svg.append(
	...groups,
	getText('A', points[0], strokeRadius, -0.9, 0.8),
	getText('B', points[1], strokeRadius, -1.2, 0),
	getText('C', points[2], strokeRadius, 0.4, 0.4),
	getText('D', points[4], strokeRadius, -1.4, 0.3),
);

export default svg;
