import {SVG_NAMESPACE} from '@/shared';

import {getProgressed} from '../../rotation/shared';

export const getLine = ([x1, y1], [x2, y2]) => {
	const line = document.createElementNS(SVG_NAMESPACE, 'line');
	
	line.setAttribute('x1', x1);
	line.setAttribute('y1', y1);
	line.setAttribute('x2', x2);
	line.setAttribute('y2', y2);
	
	return line;
};

export const getSplit = (from, to, ratio) => {
	const {x, y} = getProgressed({x: from[0], y: from[1]}, {x: to[0], y: to[1]}, ratio);
	
	return [from, [x, y], to];
};

export const COLOURS = ['#42b9d3', '#daa041', '#8e44c3'];

export const getBorder = (rX, rY, strokeDiameter) => {
	const border = document.createElementNS(SVG_NAMESPACE, 'path');
	
	border.setAttribute('stroke-width', strokeDiameter);
	border.setAttribute('stroke-linecap', 'square');
	border.setAttribute('d', `M${strokeDiameter - rX} ${-rY}L${rX} ${-rY}L${rX} ${rY}L${-rX} ${rY}L${-rX} ${-rY}`);
	
	return border;
};

export const getDiagram = (radii, strokeRadius, topLeft, topRight, transforms) => {
	const strokeDiameter = strokeRadius * 2;
	
	const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
	
	const rX = radii.x + strokeDiameter + strokeRadius;
	const rY = radii.y + strokeDiameter + strokeRadius;
	
	svg.setAttribute('viewBox', `${-rX} ${-rY} ${rX * 2} ${rY * 2}`);
	svg.setAttribute('fill', 'none');
	svg.setAttribute('stroke', 'black');
	svg.setAttribute('stroke-linecap', 'round');
	svg.setAttribute('stroke-width', strokeRadius);
	svg.setAttribute('stroke-opacity', '0.8');
	
	svg.style.maxHeight = '100%';
	svg.style.backgroundColor = '#222222';
	
	const image = document.createElementNS(SVG_NAMESPACE, 'path');
	
	image.setAttribute('d', `M${topLeft[0]} ${topLeft[1]}L${topRight[0]} ${topRight[1]}L${-topLeft[0]} ${-topLeft[1]}L${-topRight[0]} ${-topRight[1]}Z`);
	image.style.color = '#382f3c';
	image.setAttribute('fill', 'currentcolor');
	image.setAttribute('stroke-width', strokeDiameter);
	
	const axes = document.createElementNS(SVG_NAMESPACE, 'g');
	
	axes.setAttribute('stroke', '#aaa');
	axes.setAttribute('stroke-dasharray', `0 ${strokeRadius * 5}`);
	axes.setAttribute('stroke-opacity', '1');
	
	axes.append(...[
		[(topRight[0] - topLeft[0]) / 2, (topRight[1] - topLeft[1]) / 2],
		[(topRight[0] + topLeft[0]) / 2, (topRight[1] + topLeft[1]) / 2],
	].map((point) => [
		getLine([0, 0], point),
		getLine([0, 0], [-point[0], -point[1]]),
	]).flat());
	
	if (transforms) {
		image.setAttribute('transform', transforms);
		axes.setAttribute('transform', transforms);
	}
	
	svg.append(image, axes, getBorder(rX - strokeRadius, rY - strokeRadius, strokeDiameter));
	
	return svg;
};

export const getText = (text, [x, y], strokeRadius, offsetX = 0, offsetY = 0, isSmall = false) => {
	const fontSize = strokeRadius * (isSmall ? 7 : 10);
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
