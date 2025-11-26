import {SVG_NAMESPACE} from '@/shared';

import {COLOURS, getDiagram, getLine, getText} from '../../shared/svg';

const radii = {x: 20, y: 20};
const strokeDiameter = 0.4;

const svg = getDiagram(
	radii, strokeDiameter,
	[-radii.x * 1.7, -radii.y * 0.2],
	[radii.x * 0.8, -radii.y * 1.5],
	`translate(${radii.x * -0.4}, ${radii.y * 0.5})`,
);

const points = [
	[0, radii.y * 0.29, 0],
	[-radii.x * 0.43, radii.y * -0.57, 0],
	[radii.x * 0.4, -radii.y, [0, 1]],
	[0, radii.y * 0.29, 1],
	[0, -radii.y, [1, 2]],
	[radii.x * 0.4, -radii.y, 2],
	[radii.x, -radii.y],
];

const curve0 = document.createElementNS(SVG_NAMESPACE, 'path');

curve0.setAttribute('d', 'M0 -2a5 5 0 0 1 2 0.4');
curve0.setAttribute('stroke', COLOURS[1]);

const curve1 = document.createElementNS(SVG_NAMESPACE, 'path');

curve1.setAttribute('d', 'M0 -1.2a5 5 0 0 0 -3 0.8');
curve1.setAttribute('stroke', 'currentcolor');

const rect0 = document.createElementNS(SVG_NAMESPACE, 'rect');

rect0.setAttribute('x', points[4][0]);
rect0.setAttribute('y', points[4][1]);
rect0.setAttribute('width', '2');
rect0.setAttribute('height', '2');
rect0.setAttribute('stroke', COLOURS[1]);

const rect1 = document.createElementNS(SVG_NAMESPACE, 'rect');

rect1.setAttribute('x', points[1][0]);
rect1.setAttribute('y', points[1][1]);
rect1.setAttribute('width', '2');
rect1.setAttribute('height', '2');
rect1.setAttribute('stroke', COLOURS[0]);

rect1.style.transformBox = 'content-box';
rect1.style.transformOrigin = 'top left';
rect1.style.rotate = '-27deg';

const groups = [
	document.createElementNS(SVG_NAMESPACE, 'g'),
	document.createElementNS(SVG_NAMESPACE, 'g'),
	document.createElementNS(SVG_NAMESPACE, 'g'),
];

groups[0].setAttribute('stroke', COLOURS[0]);
groups[1].setAttribute('stroke', COLOURS[1]);
groups[2].setAttribute('stroke', COLOURS[2]);

const dasharray = 2 + strokeDiameter / 2;

for (let i = 0; i < points.length - 1; ++i) {
	if (typeof points[i][2] === 'number') {
		groups[points[i][2]].appendChild(getLine(points[i], points[i + 1]));
	} else {
		const line0 = getLine(points[i], points[i + 1]);
		
		line0.setAttribute('stroke-dasharray', dasharray);
		line0.setAttribute('stroke-linecap', 'butt');
		
		const line1 = line0.cloneNode();
		
		line1.setAttribute('stroke-dashoffset', dasharray);
		
		groups[points[i][2][0]].appendChild(line0);
		groups[points[i][2][1]].appendChild(line1);
	}
}

svg.append(
	curve0,
	curve1,
	rect0,
	rect1,
	...groups,
	getText('θ', [-2.8, -2.7], strokeDiameter, 0, 0, true),
	getText('α', [0.6, -3.8], strokeDiameter, 0, 0, true),
	getText('A', points[0], strokeDiameter, -0.9, 0.8),
	getText('B', points[1], strokeDiameter, -1.2, 0),
	getText('C', points[2], strokeDiameter, 0, 0.8),
	getText('D', points[4], strokeDiameter, -1.3, 0.3),
	getText('E', points[6], strokeDiameter, -0.7, 0.8),
);

export default svg;
