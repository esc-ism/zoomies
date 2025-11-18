import demo from '@/demo';
import {DEGREES} from '@/shared';

const getLimitedPosition = (limit = 0.3) => Math.max(-limit, Math.min(limit, Math.random() - 0.5));

const getSnapVarGetter = (getVars, getSnappedZoom) => {
	const {ratio, rotation, zoomPoints} = getVars();
	const position = {x: getLimitedPosition(), y: getLimitedPosition()};
	
	const zoom = getSnappedZoom(...zoomPoints, position);
	
	return {ratio, rotation, startZoom: Math.min(zoomPoints[0].z, zoomPoints[2].z), zoom, position};
};

export const getSnapTweens = (...args) => [
	[
		({rotation, ratio, startZoom}) => [{rotation, ratio, zoom: startZoom, position: 0}],
		({position}) => [{position}],
		({zoom}) => [{zoom}, {duration: 0}],
	],
	{getParam: getSnapVarGetter.bind(null, ...args)},
];

export const singleCornerGetter = (getVarGetter) => demo.ratioViewport < 1 ?
		getVarGetter(DEGREES[90] - 0.5, 0.5)() :
		getVarGetter(-DEGREES[270] + 0.5, 2)();
