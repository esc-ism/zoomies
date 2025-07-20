import {SVG_NAMESPACE} from '@/shared';

const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

svg.setAttribute('viewBox', '-12 -12 24 24');
svg.setAttribute('fill', 'none');
svg.setAttribute('stroke', 'currentcolor');
svg.setAttribute('stroke-linecap', 'round');
svg.setAttribute('stroke-linejoin', 'round');
svg.setAttribute('stroke-width', '2.5');

export const getSvg = () => svg.cloneNode();
