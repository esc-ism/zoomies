import {SVG_NAMESPACE} from '@/shared';

export const xmlns = 'http://www.w3.org/1998/Math/MathML';

export const opSpace = {tag: 'mspace', style: {width: '0.8em'}, xmlns};
export const getOverlined = (content) => ({
	tag: 'mrow', xmlns, style: {textDecoration: 'overline', textDecorationThickness: '1px'}, content: content.split('').map((content) => ({
		tag: 'mi', xmlns, content,
	})),
});

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
	
	svg.setAttribute('viewBox', `${-radii.x - strokeRadius} ${-radii.y - strokeRadius} ${radii.x * 2 + strokeDiameter} ${radii.y * 2 + strokeDiameter}`);
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
		getLine([-radii.x, -radii.y], [radii.x, -radii.y]),
		getLine([radii.x, -radii.y], [radii.x, radii.y]),
		getLine([radii.x, radii.y], [-radii.x, radii.y]),
		getLine([-radii.x, radii.y], [-radii.x, -radii.y]),
	);
	
	svg.append(border, axes);
	
	return svg;
};
