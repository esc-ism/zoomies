import demo from '@/demo';
import {DEGREES} from '@/shared';

const getLimitedPosition = (limit = 0.3) => Math.max(-limit, Math.min(limit, Math.random() - 0.5));

const getSnapVarGetter = (getVars, getSnappedZoom) => {
	const {ratio, rotation, zoomPoints} = getVars();
	const position = {x: getLimitedPosition(), y: getLimitedPosition()};
	
	const zoom = getSnappedZoom(...zoomPoints, position);
	
	return {ratio, rotation, startZoom: Math.min(zoomPoints[0].z, zoomPoints[2].z), zoom, position};
};

export const getSnapOptions = (doPullback = true) => [
	[{position: 0}, {ease: 'power2.in', duration: 0.5}],
	({position}) => [{target: position}, {ease: 'power2.out', position: 0.5}],
	({rotation, ratio, startZoom}) => [{rotation, ratio, zoom: startZoom}, {position: '0'}],
	...doPullback ? [({startZoom, position}) => [{zoom: startZoom / 1.05, target: position}, {duration: 0.3, ease: 'power3.out', position: '+=0'}]] : [],
	({position, zoom}) => [{position, zoom}, {duration: 0, position: '+=0'}],
];

export const getSnapTweens = (...args) => [
	getSnapOptions(),
	{getParam: getSnapVarGetter.bind(null, ...args)},
];

export const singleCornerGetter = (getVarGetter) => demo.ratioViewport < 1 ?
		{axis: 0, ...getVarGetter(DEGREES[90] - 0.5, 0.5)()} :
		{axis: 1, ...getVarGetter(-DEGREES[270] + 0.5, 2)()};
