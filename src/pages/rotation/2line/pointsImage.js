import {SVG_NAMESPACE} from '@/shared';

import {COLOURS, getDiagram, getLine, getText} from '../../shared/svg';

const radii = {x: 25, y: 20};
const strokeRadius = 0.4;

const svg = getDiagram(
	radii, strokeRadius,
	[-radii.x * 0.8, -radii.y],
	[radii.x * 1.15, -radii.y * 0.2],
);

const points = [
	[0, 0],
	[radii.x * 0.255, -radii.y * 0.895],
	[0, -radii.y],
];

const curve = document.createElementNS(SVG_NAMESPACE, 'path');

curve.setAttribute('d', 'M0 -6a5 5 0 0 1 2 0.4');
curve.setAttribute('stroke', 'currentcolor');

const rect = document.createElementNS(SVG_NAMESPACE, 'rect');

rect.setAttribute('x', points[1][0]);
rect.setAttribute('y', points[1][1]);
rect.setAttribute('width', '2');
rect.setAttribute('height', '2');
rect.setAttribute('stroke', COLOURS[0]);
rect.setAttribute('transform', 'translate(-2)');

rect.style.transformBox = 'content-box';
rect.style.transformOrigin = 'top left';
rect.style.rotate = '19deg';

const group = document.createElementNS(SVG_NAMESPACE, 'g');

group.setAttribute('stroke', COLOURS[0]);

for (let i = 0; i < points.length; ++i) {
	group.appendChild(getLine(points[i], points[(i + 1) % points.length]));
}

svg.append(
	curve,
	rect,
	group,
	getText('θ', [0, -7.6], strokeRadius, 0.25, 0, true),
	getText('A', points[0], strokeRadius, -0.2, 1),
	getText('B', points[1], strokeRadius, 0.45, 0.2),
	getText('C', points[2], strokeRadius, -1.5, 0.4),
);

export default svg;
