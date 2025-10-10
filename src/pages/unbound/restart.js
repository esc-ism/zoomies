import {SVG_NAMESPACE} from '@/pages/shared/svg';

const RADIUS_Y = 10;
const RADIUS_X = 14;

const BAR_X = -9;
const TRIANGLE_X = -4;

const STROKE_WIDTH = 2;

const container = document.createElement('p');
const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
const bar = document.createElementNS(SVG_NAMESPACE, 'line');
const triangle = document.createElementNS(SVG_NAMESPACE, 'path');

svg.setAttribute('viewBox', '-12 -12 24 24');
svg.setAttribute('stroke-width', STROKE_WIDTH);
svg.setAttribute('stroke', 'currentcolor');
svg.setAttribute('fill', 'currentcolor');

bar.setAttribute('x1', BAR_X);
bar.setAttribute('x2', BAR_X);
bar.setAttribute('y1', -RADIUS_Y - STROKE_WIDTH / 2);
bar.setAttribute('y2', RADIUS_Y + STROKE_WIDTH / 2);

triangle.setAttribute('d', `M${TRIANGLE_X} ${0}l${RADIUS_X} ${-RADIUS_Y}l${0} ${RADIUS_Y * 2}Z`);

svg.style.height = '2em';
svg.style.verticalAlign = 'middle';

container.style.textAlign = 'center';

svg.append(bar, triangle);
container.appendChild(svg);

export default () => container.cloneNode(true);
