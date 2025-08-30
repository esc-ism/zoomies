import Rails from '@/demo/lines/rails';
import Demo from '../demo';

import {getZoomProgressed, getProgressedLine, getIntersectProgress, getProgress, getFlipped} from '../shared';
import getConstrainerFromPoints from '../shared/constrain';

import {CORNERS} from '@/pages/consts';
import getZoomPoints, {getRelevantDemo} from './zoomPoints';
import {DEGREES} from '@/shared';
import {getDimensions} from '../2line';

export const getVarGetter = (demo, rotation = DEGREES[90], ratio = 1) => () => {
	const zoomPoints = getZoomPoints(getRelevantDemo({...demo, rotation, sizesImage: getDimensions(ratio, demo.sizesViewport)}));
	
	return {zoomPoints, rotation, ratio};
};

export const getBound = (zoom, first, second, third) => {
	if (zoom <= first.z) {
		return false;
	}
	
	if (zoom <= third.z) {
		if (third.isFirstInt || zoom <= second.z) {
			return {
				...getZoomProgressed(first, first.end, zoom),
				m: first.end.y / first.end.x,
				c: 0,
				isFirst: true,
			};
		}
		
		return {...getZoomProgressed(second, second.end, zoom), m: (second.y - second.end.y) / second.x - second.end.x, c: 0, isFirst: true};
	}
	
	const progress = zoom / third.z;
	
	return {
		x: third.end.x - (third.end.x - third.x) / progress,
		y: third.end.y - (third.end.y - third.y) / progress,
	};
};

export const getSnappedZoom = (() => {
	const getDirected = (first, second, flip, cornerX) => {
		const get = flip ? (position) => getFlipped(position) : ({...position}) => ({...position});
		
		return [[get(first), get(first.end)], [{...get(second), z: second.z}, get({x: cornerX, y: 0.5})]];
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
	
	const getZoom = (position, doFlip, ...pairs) => {
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
	
	return (first0, second0, third0, first1, second1, third1, position) => {
		const getPairings = (flip0, flip1) => {
			const [lineFirst0, lineSecond0] = getDirected(third0.isFirstInt ? first0 : second0, third0, flip0, -0.5);
			const [lineFirst1, lineSecond1] = getDirected(third1.isFirstInt ? first1 : second1, third1, flip1, 0.5);
			
			const pairings = third0.z >= third1.z ?
					[
						[third1.z, getProgressedLine(lineFirst0, third1), lineSecond1],
						[third0.z, lineSecond0, getProgressedLine(lineSecond1, third0)],
					] :
					[
						[third0.z, lineSecond0, getProgressedLine(lineFirst1, third0)],
						[third1.z, getProgressedLine(lineSecond0, third1), lineSecond1],
					];
			
			if (third0.isFirstInt || third1.isFirstInt) {
				pairings.unshift(third1.isFirstInt ?
						[second0.z, lineSecond0, getProgressedLine(lineFirst1, second0)] :
						[second1.z, getProgressedLine(lineFirst0, second1), lineSecond1]);
			}
			
			return pairings;
		};
		
		return Math.max(...[
			getZoom(position, false, ...getPairings(false, false)),
			getZoom(position, true, ...getPairings(false, true)),
			getZoom(position, true, ...getPairings(true, false)),
			getZoom(position, false, ...getPairings(true, true)),
		].filter(isValidZoom));
	};
})();

export const getRailProgress = (zoom, first, second, third) => {
	if (zoom <= first.z) {
		return [0, 0, 0];
	}
	
	if (zoom <= second.z) {
		return [getProgress(first.z, zoom) * second.p, 0, 0];
	}
	
	if (zoom <= third.z) {
		return [1, getProgress(second.z, zoom) * third.p, 0];
	}
	
	return [1, 1, getProgress(third.z, zoom)];
};

export default class extends Demo {
	static getZoomPoints = getZoomPoints;
	
	rails = new Rails(6, this, false, false, true);
	
	setRails() {
		this.rails.set(
			[{x: 0, y: 0}, this.zoomPoints[1]],
			[this.zoomPoints[1], this.zoomPoints[2]],
			[this.zoomPoints[2], CORNERS.TOP_LEFT],
			[{x: 0, y: 0}, this.zoomPoints[4]],
			[this.zoomPoints[4], this.zoomPoints[5]],
			[this.zoomPoints[5], CORNERS.TOP_RIGHT],
		);
	}
	
	setRailsProgress() {
		this.rails.setProgress(
			...getRailProgress(this.zoom, this.zoomPoints[0], this.zoomPoints[1], this.zoomPoints[2]),
			...getRailProgress(this.zoom, this.zoomPoints[3], this.zoomPoints[4], this.zoomPoints[5]),
		);
	}
	
	getPositionConstrainer() {
		return getConstrainerFromPoints(
			this.bound0 = getBound(this.zoom, this.zoomPoints[0], this.zoomPoints[1], this.zoomPoints[2]),
			this.bound1 = getBound(this.zoom, this.zoomPoints[3], this.zoomPoints[4], this.zoomPoints[5]),
		);
	}
	
	getZoomPoints() {
		return this.constructor.getZoomPoints(getRelevantDemo(this), this.getAllStartZooms());
	}
	
	getSnappedZoom() {
		return getSnappedZoom(
			this.zoomPoints[0], this.zoomPoints[1], this.zoomPoints[2],
			this.zoomPoints[3], this.zoomPoints[4], this.zoomPoints[5],
			this.position,
		);
	}
}
