import {SVG_NAMESPACE} from '@/shared';

import {getSvg} from '../shared';

import {INNER, OUTER} from './shared';

const lines = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([multX, multY]) => {
	const line = document.createElementNS(SVG_NAMESPACE, 'polyline');
	
	line.setAttribute('points', `${INNER * multX} ${OUTER * multY} ${OUTER * multX} ${OUTER * multY} ${OUTER * multX} ${INNER * multY}`);
	
	return line;
});

const svg = getSvg();

svg.append(...lines);

export default () => svg.cloneNode(true);
