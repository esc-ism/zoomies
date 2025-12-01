import {CLASS_SEMANTIC_BUTTON} from '@/consts';
import {SVG_NAMESPACE} from '@/shared';

const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

svg.setAttribute('viewBox', '-12 -12 24 24');
svg.setAttribute('fill', 'none');
svg.setAttribute('stroke', 'currentcolor');
svg.setAttribute('stroke-linecap', 'round');
svg.setAttribute('stroke-linejoin', 'round');
svg.setAttribute('stroke-width', '2.5');
svg.setAttribute('height', '100%');

export const getSvg = () => svg.cloneNode();

const button = document.createElement('button');

button.tabIndex = -1;
button.classList.add(CLASS_SEMANTIC_BUTTON);

export const getWrapper = () => button.cloneNode();
