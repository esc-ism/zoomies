import {getFlipped, getProgress, getProgressedLine, getZoomPairSecond} from '.';

export const getDirected = (first, second, flip, cornerX) => {
	const get = flip ? (position) => getFlipped(position) : ({x, y}) => ({x, y});
	
	return [[get(first), get(first.end)], [{...get(second), z: second.z}, get({x: cornerX, y: 0.5})]];
};

export const isValidZoom = (zoom) => zoom !== null && !isNaN(zoom);

export const getZoom = (position, doFlip, ...pairs) => {
	let maxP;
	
	for (let i = pairs.length - 1; i >= 1; i--) {
		const zoom = getZoomPairSecond(pairs[i], position, doFlip, maxP);
		
		if (zoom) {
			return zoom;
		}
		
		maxP = getProgress(pairs[i - 1][0], pairs[i][0]);
	}
	
	return getZoomPairSecond(pairs[0], position, doFlip, maxP);
};

export const getFirstPairing = (first0, first1, lineFirst0, lineFirst1) => first0.z >= first1.z ?
		[first0.z, lineFirst0, getProgressedLine(lineFirst1, first0)] :
		[first1.z, getProgressedLine(lineFirst0, first1), lineFirst1];

export const getSecondPairings = (second0, second1, lineFirst0, lineFirst1, lineSecond0, lineSecond1) => second0.z >= second1.z ?
		[
			[second1.z, getProgressedLine(lineFirst0, second1), lineSecond1],
			[second0.z, lineSecond0, getProgressedLine(lineSecond1, second0)],
		] :
		[
			[second0.z, lineSecond0, getProgressedLine(lineFirst1, second0)],
			[second1.z, getProgressedLine(lineSecond0, second1), lineSecond1],
		];
