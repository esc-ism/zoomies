import {getSvg} from './shared';

import {SVG_NAMESPACE} from '@/shared';

const path = document.createElementNS(SVG_NAMESPACE, 'path');

path.setAttribute('d', 'M9 -9V-4M9 -3.5H4M9 -4L6 -6.7C4.4 -8.3 2.3 -9 0 -9C-5 -9 -9 -5 -9 0C-9 5 -5 9 0 9C4.3 9 7.9 6 8.8 2');

const svg = getSvg();

svg.appendChild(path);

export default () => svg.cloneNode(true);
