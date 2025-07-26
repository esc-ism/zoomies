import './css';

import welcome from './welcome';
import unbound from './unbound';
import center from './center';
import edge from './edge';
import origin from './rotation/origin';
import axisViewport from './rotation/2line/axisViewport';
import axisIntersectPartial from './rotation/2line/intersect/partial';
import axisIntersectComplete from './rotation/2line/intersect/complete';
import axisImagePartial from './rotation/2line/axisImage/partial';
import axisImageComplete from './rotation/2line/axisImage/complete';

export default [
	welcome, unbound, center, edge, origin,
	axisViewport, axisIntersectPartial, axisIntersectComplete, axisImagePartial, axisImageComplete,
];
