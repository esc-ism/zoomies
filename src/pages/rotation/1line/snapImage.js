import {SVG_NAMESPACE} from '@/shared';
import {COLOURS, getDiagram, getLine, getSplit, getText} from '../../shared/svg';

const radii = {x: 25, y: 20};
const outerRadii = {x: 32, y: 25};
const strokeRadius = 0.4;

const svg = getDiagram(
	{x: 32, y: 25}, strokeRadius,
	[-radii.x * 0.8 - strokeRadius, -radii.y - strokeRadius],
	[radii.x * 1.15 + strokeRadius, -radii.y * 0.2 - strokeRadius],
);

const points = [
	[[0, 0], [-radii.x * 0.8 - strokeRadius, -radii.y - strokeRadius], 0],
	[[radii.x * 0.3, -radii.y * 0.05], [radii.x * 1.15 + strokeRadius, -radii.y * 0.2 - strokeRadius], 1],
];

const groups = [
	document.createElementNS(SVG_NAMESPACE, 'g'),
	document.createElementNS(SVG_NAMESPACE, 'g'),
];

groups[0].setAttribute('stroke', COLOURS[0]);
groups[1].setAttribute('stroke', COLOURS[1]);

for (const [start, end, colour] of points) {
	groups[colour].appendChild(getLine(start, end));
}

const [start, snap, end] = getSplit([-outerRadii.x, -radii.y * 0.73], [outerRadii.x, radii.y * 0.05], 0.48);
const dasharray = strokeRadius * 7.2;

const background = getLine(start, end);

background.setAttribute('stroke', COLOURS[2]);

const getDash = (from, to) => {
	const dash = getLine(from, to);
	
	dash.setAttribute('stroke-dasharray', dasharray);
	dash.setAttribute('stroke-linecap', 'butt');
	
	return dash;
};

groups[0].appendChild(getDash(snap, start));
groups[1].appendChild(getDash(snap, end));

const crosshairWidth = strokeRadius * 2;
const crosshairG = document.createElementNS(SVG_NAMESPACE, 'g');

crosshairG.setAttribute('stroke', 'white');
crosshairG.setAttribute('opacity', '1');
crosshairG.setAttribute('stroke-width', `${strokeRadius / 2}`);

crosshairG.append(
	getLine([snap[0] - crosshairWidth, snap[1] - crosshairWidth], [snap[0] + crosshairWidth, snap[1] + crosshairWidth]),
	getLine([snap[0] - crosshairWidth, snap[1] + crosshairWidth], [snap[0] + crosshairWidth, snap[1] - crosshairWidth]),
);

svg.append(
	background,
	...groups,
	crosshairG,
	getText('A', [0, 0], strokeRadius, -0.2, 1),
	getText('B', points[0][1], strokeRadius, -0.8, -1),
	getText('C', points[1][0], strokeRadius, -1.2, 0),
	getText('D', points[1][1], strokeRadius, -0.2, -1),
	getText('E', [-11, -6.5], strokeRadius),
	getText('F', [16, 0], strokeRadius),
	getText('(x, y)', snap, strokeRadius, -1.8, -1.4),
);

export default svg;
