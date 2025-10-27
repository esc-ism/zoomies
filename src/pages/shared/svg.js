import {SVG_NAMESPACE} from '@/shared';

export const getLine = ([x1, y1], [x2, y2]) => {
	const line = document.createElementNS(SVG_NAMESPACE, 'line');
	
	line.setAttribute('x1', x1);
	line.setAttribute('y1', y1);
	line.setAttribute('x2', x2);
	line.setAttribute('y2', y2);
	
	return line;
};

// todo delete
export const OLD_COLOURS = ['#374', '#962', '#722'];
export const COLOURS = ['rgba(218, 160, 65, 1)', 'rgba(66, 185, 211, 1)'];

export const getDiagram = (radii, strokeRadius, topLeft, topRight) => {
	const strokeDiameter = strokeRadius * 2;
	
	const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
	
	svg.setAttribute('viewBox', `${-radii.x - strokeDiameter} ${-radii.y - strokeDiameter} ${(radii.x + strokeDiameter) * 2} ${(radii.y + strokeDiameter) * 2}`);
	svg.setAttribute('fill', 'none');
	svg.setAttribute('stroke', 'black');
	svg.setAttribute('stroke-linecap', 'round');
	svg.setAttribute('stroke-width', strokeDiameter);
	svg.setAttribute('stroke-opacity', '0.8');
	
	svg.style.textAlign = 'center';
	svg.style.backgroundColor = '#111';
	svg.style.maxHeight = `min(calc(100dvh - 2em - 16px), ${130 / strokeRadius}px)`;
	
	const image = document.createElementNS(SVG_NAMESPACE, 'path');
	
	image.setAttribute('d', `M${topLeft[0]} ${topLeft[1]}L${topRight[0]} ${topRight[1]}L${-topLeft[0]} ${-topLeft[1]}L${-topRight[0]} ${-topRight[1]}Z`);
	image.style.color = 'var(--background)';
	image.setAttribute('fill', 'currentcolor');
	
	svg.append(image);
	
	const axes = document.createElementNS(SVG_NAMESPACE, 'g');
	
	axes.setAttribute('stroke', '#aaa');
	axes.setAttribute('stroke-dasharray', '0.1 2');
	axes.setAttribute('stroke-width', strokeRadius);
	axes.setAttribute('stroke-opacity', '1');
	
	axes.append(...[
		[(topRight[0] - topLeft[0]) / 2, (topRight[1] - topLeft[1]) / 2],
		[(topRight[0] + topLeft[0]) / 2, (topRight[1] + topLeft[1]) / 2],
	].map((point) => getLine([-point[0], -point[1]], point)));
	
	const border = document.createElementNS(SVG_NAMESPACE, 'g');
	
	border.append(
		getLine([-radii.x - strokeRadius, -radii.y - strokeRadius], [radii.x + strokeRadius, -radii.y - strokeRadius]),
		getLine([radii.x + strokeRadius, -radii.y - strokeRadius], [radii.x + strokeRadius, radii.y + strokeRadius]),
		getLine([radii.x + strokeRadius, radii.y + strokeRadius], [-radii.x - strokeRadius, radii.y + strokeRadius]),
		getLine([-radii.x - strokeRadius, radii.y + strokeRadius], [-radii.x - strokeRadius, -radii.y - strokeRadius]),
	);
	
	svg.append(border, axes);
	
	return svg;
};

export const getText = (text, [x, y], strokeRadius, offsetX = 0, offsetY = 0) => {
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
