import {SVG_NAMESPACE} from '@/shared';
import {CLASS_SEMANTIC_BUTTON} from '@/consts';

import {CLASS_BUTTON} from './consts';

import './css';

export const getSVG = () => {
	const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
	
	svg.setAttribute('viewBox', '0 0 32 32');
	svg.setAttribute('stroke', 'currentcolor');
	svg.setAttribute('fill', 'none');
	
	const screen = document.createElementNS(SVG_NAMESPACE, 'path');
	
	screen.setAttribute('d', 'M31.36,2v20h-0.72V2.36H1.36v22.28H12v0.721H1c-0.199,0-0.36-0.161-0.36-0.36V2c0-0.199,0.161-0.36,0.36-0.36h30C31.199,1.64,31.36,1.801,31.36,2z');
	
	svg.appendChild(screen);
	
	return svg;
};

export default (child, isMouse) => {
	const button = document.createElement('button');
	
	button.classList.add(CLASS_BUTTON, CLASS_SEMANTIC_BUTTON);
	
	button.style.height = '100%';
	button.style.aspectRatio = '1 / 1';
	button.style.width = 'auto';
	button.style.display = 'flex';
	button.style.justifyContent = 'center';
	button.style.alignItems = 'center';
	button.style.borderRight = '1px solid currentcolor';
	
	button.setAttribute('title', `${isMouse ? 'Mouse' : 'Touchscreen'} controls`);
	
	child.style.height = '60%';
	
	button.appendChild(child);
	
	return button;
};
