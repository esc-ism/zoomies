import {SVG_NAMESPACE} from '@/shared';

import getWrapped, {getSVG} from './button';

const svg = getSVG();

const hand = document.createElementNS(SVG_NAMESPACE, 'path');

hand.setAttribute('d', 'M14 10v13l3.31-3.47 2.69 6.47 1.37-0.63-2.72-6.37h4.35l-9-9z');

hand.setAttribute('stroke-linejoin', 'round');

hand.style.scale = '1.2';

svg.append(hand);

export default getWrapped(svg, true);
