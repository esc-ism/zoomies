import {SVG_NAMESPACE} from '@/shared';
import {COLOURS, getDiagram, getLine} from '@/pages/shared/svg';

const radii = {x: 25, y: 20};
const strokeRadius = 0.4;

const svg = getDiagram(
	{x: 32, y: 25}, strokeRadius,
	[-radii.x * 0.8 - strokeRadius, -radii.y - strokeRadius],
	[radii.x * 1.15 + strokeRadius, -radii.y * 0.2 - strokeRadius],
);

const points = [
	[0, 0, 0],
	[0, -radii.y, 0],
	[-radii.x * 0.8 - strokeRadius, -radii.y, 2],
	[0, 0, 1],
	[radii.x * 0.17, radii.y * -0.6, 1],
	[-radii.x * 0.8 - strokeRadius, -radii.y],
];

const getText = (text, [x, y], strokeRadius, offsetX = 0, offsetY = 0) => {
	const fontSize = strokeRadius * 10;
	const element = document.createElementNS(SVG_NAMESPACE, 'text');
	
	element.textContent = text;
	element.style.fontSize = `${fontSize}px`;
	element.style.fontFamily = '"cambria math", math';
	element.style.fill = 'currentcolor';
	element.style.userSelect = 'none';
	
	element.setAttribute('stroke-width', '0');
	element.setAttribute('x', x);
	element.setAttribute('y', y);
	element.setAttribute('dx', `${fontSize * offsetX / 1.5}px`);
	element.setAttribute('dy', `${fontSize / 3 + fontSize * offsetY / 1.5}px`);
	
	return element;
};

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

svg.append(...groups);

svg.appendChild(getText('A', points[0], strokeRadius, -0.2, 1));
svg.appendChild(getText('B', points[2], strokeRadius, -0.8, -1));
svg.appendChild(getText('C', points[1], strokeRadius, -0.2, -1));
svg.appendChild(getText('D', points[4], strokeRadius, 0.2, -0.8));

export default svg;
