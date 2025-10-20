import {SVG_NAMESPACE} from '@/shared';

const radius = 5;
const strokeRadius = 0.4;
const bodyRadius = 0.6;

const diameter = radius * 2;
const strokeDiameter = strokeRadius * 2;
const bodyDiameter = bodyRadius * 2;

const offsetRadius = strokeRadius + bodyRadius;
const offsetDiameter = strokeDiameter + bodyDiameter;

const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

svg.setAttribute('viewBox', `${-radius - offsetRadius - strokeRadius} ${-radius - offsetRadius - strokeRadius} ${diameter + offsetDiameter + strokeDiameter} ${diameter + offsetDiameter + strokeDiameter}`);
svg.setAttribute('stroke', 'white');
svg.setAttribute('stroke-linecap', 'round');
svg.setAttribute('stroke-width', strokeDiameter);

svg.style.width = '16px';
svg.style.position = 'absolute';
svg.style.top = '50%';
svg.style.left = '50%';
svg.style.translate = '-50% -50%';
svg.style.userSelect = 'none';
svg.style.pointerEvents = 'none';

const cross = document.createElementNS(SVG_NAMESPACE, 'path');

cross.setAttribute('d', `M${offsetRadius} ${-offsetRadius}` +
`l${radius} 0l0 ${offsetDiameter}l${-radius} 0` +
`l0 ${radius}l${-offsetDiameter} 0l0 ${-radius}` +
`l${-radius} 0l0 ${-offsetDiameter}l${radius} 0` +
`l0 ${-radius}l${offsetDiameter} 0l0 ${radius}Z`);

svg.appendChild(cross);

export default svg;
