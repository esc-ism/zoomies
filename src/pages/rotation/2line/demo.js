import Rails from '@/demo/lines/rails';
import Demo from '../demo';

import {getBound, getProgressedLine, getIntersectProgress, getProgress, getFlipped} from '../shared';
import getConstrainerFromPoints from '../shared/constrain';

import {CORNERS} from '@/pages/consts';
import getZoomPoints, {getRelevantDemo} from './zoomPoints';

export const getSnappedZoom = (() => {
	const getDirected = (first, second, flip, cornerX) => {
		const get = flip ? (position) => getFlipped(position) : ({x, y}) => ({x, y});
		
		return [[first, get(second.vpEnd)], [{...get(second), z: second.z}, get({x: cornerX, y: 0.5})]];
	};
	
	const isValidZoom = (zoom) => zoom !== null && !isNaN(zoom);
	
	const getZoomPairSecond = ([z, ...pair], position, doFlip, maxP = 1) => {
		if (maxP >= 0) {
			const p = getIntersectProgress(position, ...pair, doFlip);
			
			if (p >= 0 && p <= maxP) {
				// I don't think the >= 1 check is necessary but best be safe
				return p >= 1 ? Number.MAX_SAFE_INTEGER : z / (1 - p);
			}
		}
		
		return null;
	};
	
	const getZoom = (pair0, pair1, pair2, position, doFlip) => getZoomPairSecond(pair2, position, doFlip)
		|| getZoomPairSecond(pair1, position, doFlip, getProgress(pair1[0], pair2[0]))
		|| getZoomPairSecond(pair0, position, doFlip, getProgress(pair0[0], pair1[0]));
	
	return (first0, second0, first1, second1, position) => {
		const getPairings = (flip0, flip1) => {
			const [lineFirst0, lineSecond0] = getDirected(first0, second0, flip0, -0.5);
			const [lineFirst1, lineSecond1] = getDirected(first1, second1, flip1, 0.5);
			
			return [
				first0.z >= first1.z ?
						[first0.z, lineFirst0, getProgressedLine(lineFirst1, first0)] :
						[first1.z, getProgressedLine(lineFirst0, first1), lineFirst1],
				
				...second0.z >= second1.z ?
						[
							[second1.z, getProgressedLine(lineFirst0, second1), lineSecond1],
							[second0.z, lineSecond0, getProgressedLine(lineSecond1, second0)],
						] :
						[
							[second0.z, lineSecond0, getProgressedLine(lineFirst1, second0)],
							[second1.z, getProgressedLine(lineSecond0, second1), lineSecond1],
						],
			];
		};
		
		return Math.max(...[
			getZoom(...getPairings(false, false), position),
			getZoom(...getPairings(false, true), position, true),
			getZoom(...getPairings(true, false), position, true),
			getZoom(...getPairings(true, true), position),
		].filter(isValidZoom));
	};
})();

const getRailProgress = (zoom, first, second) => {
	if (zoom <= first.z) {
		return [0, 0];
	}
	
	if (zoom <= second.z) {
		return [getProgress(first.z, zoom) * second.p, 0];
	}
	
	return [1, getProgress(second.z, zoom)];
};

export default class extends Demo {
	rails = new Rails(4, this, false, false, true);
	
	setRails() {
		this.rails.set(
			[{x: 0, y: 0}, this.zoomPoints[1]],
			[this.zoomPoints[1], CORNERS.TOP_LEFT],
			[{x: 0, y: 0}, this.zoomPoints[3]],
			[this.zoomPoints[3], CORNERS.TOP_RIGHT],
		);
	}
	
	setRailsProgress() {
		this.rails.setProgress(
			...getRailProgress(this.zoom, this.zoomPoints[0], this.zoomPoints[1]),
			...getRailProgress(this.zoom, this.zoomPoints[2], this.zoomPoints[3]),
		);
	}
	
	getPositionConstrainer() {
		return getConstrainerFromPoints(
			this.bound0 = getBound(this.zoom, this.zoomPoints[0], this.zoomPoints[1], true),
			this.bound1 = getBound(this.zoom, this.zoomPoints[2], this.zoomPoints[3], false),
		);
	}
	
	getZoomPoints() {
		return getZoomPoints(getRelevantDemo(this), this.getAllStartZooms());
	}
	
	getSnappedZoom() {
		return getSnappedZoom(...this.zoomPoints, this.position);
	}
}
