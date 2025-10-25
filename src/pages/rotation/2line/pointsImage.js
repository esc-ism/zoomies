import {SVG_NAMESPACE} from '@/shared';
import {OLD_COLOURS, getDiagram, getLine} from '@/pages/shared/svg';

const radii = {x: 25, y: 20};
const strokeRadius = 0.4;

const svg = getDiagram(
	radii, strokeRadius,
	[-radii.x * 0.8 - strokeRadius, -radii.y - strokeRadius],
	[radii.x * 1.15 + strokeRadius, -radii.y * 0.2 - strokeRadius],
);

const points = [
	[0, -radii.y],
	[radii.x * 0.255, -radii.y * 0.895],
	[0, 0],
];

for (let i = 0; i < 3; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke', OLD_COLOURS[i]);
	
	group.append(getLine(points[i], points[(i + 1) % 3]));
	
	svg.appendChild(group);
}

export default svg;
