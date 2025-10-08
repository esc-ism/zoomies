/* <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
 <g>
  <title>Layer 1</title>
  <rect id="svg_14" height="24.75" width="42.625" y="13.48014" x="3.85116" stroke="#000" fill="none"/>
  <line stroke="#000" id="svg_17" y2="31.35514" x2="3.97616" y1="38.23014" x1="16.22616" fill="none"/>
  <line stroke="#000" id="svg_20" y2="13.60514" x2="14.35116" y1="30.73014" x1="3.97616" fill="none"/>
  <line stroke="#000" id="svg_22" y2="20.85514" x2="46.22616" y1="37.98014" x1="35.35116" fill="none"/>
  <line stroke="#000" id="svg_23" y2="13.60514" x2="33.85116" y1="20.48014" x1="46.10116" fill="none"/>
  <line id="svg_24" y2="25.73014" x2="45.97616" y1="25.60514" x1="25.35116" stroke="#000" fill="none"/>
  <line id="svg_25" y2="25.60514" x2="25.60116" y1="15.73014" x1="31.60116" stroke="#000" fill="none"/>
  <line id="svg_26" y2="15.48014" x2="31.22616" y1="25.48014" x1="45.97616" stroke="#000" fill="none"/>
  <path id="svg_29" d="m25.47616,25.60514c0,0 4,0 4.25,0c-0.625,-2.125 -0.625,-2.125 -2.25,-3l-2,3z" stroke="#000" fill="none"/>
 </g>

</svg> */
import {SVG_NAMESPACE} from '@/shared';
import {getProgressed} from '../shared';

const RADIUS = {X: 25, Y: 20};
const DIAMETER = {X: RADIUS.X * 2, Y: RADIUS.Y * 2};
const STROKE_RADIUS = 0.4;
const STROKE_DIAMETER = STROKE_RADIUS * 2;
const TOP_LEFT = [-RADIUS.X * 0.8 - STROKE_RADIUS, -RADIUS.Y - STROKE_RADIUS];
const TOP_RIGHT = [RADIUS.X * 1.15 + STROKE_RADIUS, -RADIUS.Y * 0.2 - STROKE_RADIUS];

const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

svg.setAttribute('viewBox', `${-RADIUS.X - STROKE_RADIUS} ${-RADIUS.Y - STROKE_RADIUS} ${DIAMETER.X + STROKE_DIAMETER} ${DIAMETER.Y + STROKE_DIAMETER}`);
svg.setAttribute('fill', 'none');
svg.setAttribute('stroke', 'black');
// svg.setAttribute('stroke-linecap', 'round');
// svg.setAttribute('stroke-linejoin', 'round');
svg.setAttribute('stroke-width', STROKE_DIAMETER);

svg.style.textAlign = 'center';
svg.style.width = '400px';
// svg.style.backgroundColor = '#222';
svg.style.border = '6px solid black';

const getLine = ([x1, y1], [x2, y2]) => {
	const line = document.createElementNS(SVG_NAMESPACE, 'line');
	
	line.setAttribute('x1', x1);
	line.setAttribute('y1', y1);
	line.setAttribute('x2', x2);
	line.setAttribute('y2', y2);
	
	return line;
};

const image = document.createElementNS(SVG_NAMESPACE, 'path');

image.setAttribute('d', `M${TOP_LEFT[0]} ${TOP_LEFT[1]}L${TOP_RIGHT[0]} ${TOP_RIGHT[1]}L${-TOP_LEFT[0]} ${-TOP_LEFT[1]}L${-TOP_RIGHT[0]} ${-TOP_RIGHT[1]}Z`);
image.setAttribute('fill', '#2f3450');

svg.append(image);

const getSplit = (from, to, ratio) => {
	const {x, y} = getProgressed({x: from[0], y: from[1]}, {x: to[0], y: to[1]}, ratio);
	
	return [from, [x, y], to];
};

const POINTS = [
	[0, 0],
	[0, -RADIUS.Y],
	[RADIUS.X * 0.24, -RADIUS.Y * 0.9],
];

const colours = ['#722', '#374', '#962'];

for (let i = 0; i < 3; ++i) {
	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	
	group.setAttribute('stroke-linecap', 'round');
	
	group.setAttribute('stroke', colours[i]);
	
	group.append(getLine(POINTS[i], POINTS[(i + 1) % 3]));
	
	svg.appendChild(group);
}

export default svg;
