import {SVG_NAMESPACE} from '@/shared';
import {COLOURS, getDiagram, getLine, getText} from '../../shared/svg';

const radii = {x: 25, y: 20};
const strokeDiameter = 0.4;

const svg = getDiagram(
	{x: 32, y: 25}, strokeDiameter,
	[-radii.x * 0.8, -radii.y],
	[radii.x * 1.15, -radii.y * 0.2],
);

const points = [
	[0, 0, 0],
	[0, -radii.y, 0],
	[-radii.x * 0.8, -radii.y, 2],
	[0, 0, 1],
	[radii.x * 0.17, radii.y * -0.6, 1],
	[-radii.x * 0.8, -radii.y],
];

const curve0 = document.createElementNS(SVG_NAMESPACE, 'path');

curve0.setAttribute('d', 'M0 -7a5 5 0 0 1 2 0.4');
curve0.setAttribute('stroke', 'currentcolor');

const rect0 = document.createElementNS(SVG_NAMESPACE, 'rect');

rect0.setAttribute('x', points[4][0]);
rect0.setAttribute('y', points[4][1]);
rect0.setAttribute('width', '2');
rect0.setAttribute('height', '2');
rect0.setAttribute('stroke', COLOURS[1]);
rect0.setAttribute('transform', 'translate(-2)');

rect0.style.transformBox = 'content-box';
rect0.style.transformOrigin = 'top left';
rect0.style.rotate = '18.7deg';

const rect1 = document.createElementNS(SVG_NAMESPACE, 'rect');

rect1.setAttribute('x', points[1][0]);
rect1.setAttribute('y', points[1][1]);
rect1.setAttribute('width', '2');
rect1.setAttribute('height', '2');
rect1.setAttribute('stroke', COLOURS[0]);
rect1.setAttribute('transform', 'translate(-2)');

const groups = [
	document.createElementNS(SVG_NAMESPACE, 'g'),
	document.createElementNS(SVG_NAMESPACE, 'g'),
];

groups[0].setAttribute('stroke', COLOURS[0]);
groups[1].setAttribute('stroke', COLOURS[1]);

const dasharray = strokeDiameter * 7.2;

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
	curve0,
	rect0,
	rect1,
	...groups,
	getText('θ', [0, -7], strokeDiameter, 0.3, -0.8, true),
	getText('A', points[0], strokeDiameter, -0.2, 1),
	getText('B', points[2], strokeDiameter, -0.8, -1),
	getText('C', points[1], strokeDiameter, -0.2, -1),
	getText('D', points[4], strokeDiameter, 0.2, -0.8),
);

export default svg;
