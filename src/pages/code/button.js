import {SVG_NAMESPACE} from '@/shared';
import {CLASS_NAMES} from './consts';

const path = document.createElementNS(SVG_NAMESPACE, 'path');

path.setAttribute('fill', 'none');
path.setAttribute('stroke', 'currentcolor');
path.setAttribute('stroke-linecap', 'round');
path.setAttribute('stroke-width', '2.5');
path.setAttribute('d', 'M21 3V8M21 8.5H16M21 8L18 5.29168C16.4077 3.86656 14.3051 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.2832 21 19.8675 18.008 20.777 14');

const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

svg.setAttribute('viewBox', '0 0 24 24');

svg.classList.add(CLASS_NAMES.refresh);

svg.appendChild(path);

export default () => svg.cloneNode(true);
