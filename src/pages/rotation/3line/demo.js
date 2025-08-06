import Rails from '@/demo/lines/rails';
import Demo from '../demo';

import {getZoomProgressed, getProgressedLine, getIntersectProgress, getProgress, getFlipped, isAbove} from '../shared';
import getConstrainerFromPoints from '../shared/constrain';

import {CORNERS} from '@/pages/consts';
import getZoomPoints, {getRelevantDemo} from './zoomPoints';
import Lines from '@/demo/lines/lines';

export const getBound = (() => {
	const get = (zoom, first, second, third) => {
		if (zoom <= first.z) {
			return false;
		}
		
		if (zoom <= second.z) {
			return {
				...getZoomProgressed(first, first.end, zoom),
				m: first.end.y / first.end.x,
				c: 0,
				isFirst: true,
			};
		}
		
		if (zoom <= third.z) {
			const {x, y} = getZoomProgressed(second, second.end, zoom);
			
			return {x, y, m: y / x, c: 0, isFirst: true};
		}
		
		const progress = zoom / third.z;
		
		return {
			x: third.end.x - (third.end.x - third.x) / progress,
			y: third.end.y - (third.end.y - third.y) / progress,
		};
	};
	
	return (zoom, first, second, third) => {
		const result = get(zoom, first, second, third);
		
		if (result && third.end.y < 0) {
			return getFlipped(result);
		}
		
		return result;
	};
})();

export const getSnappedZoom = (() => {
	const getDirected = (first, second, flip, cornerX) => {
		const get = flip ? (position) => getFlipped(position) : ({x, y}) => ({x, y});
		
		return [[first, get(first.end)], [{...get(second), z: second.z}, get({x: cornerX, y: 0.5})]];
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
	
	const getZoom = (pair0, pair1, position, doFlip) => getZoomPairSecond(pair1, position, doFlip)
		|| getZoomPairSecond(pair0, position, doFlip, getProgress(pair0[0], pair1[0]));
	
	return (second, third0, third1, position) => {
		const getPairings = (flip0, flip1) => {
			const [lineFirst0, lineSecond0] = getDirected(second, third0, flip0, -0.5);
			const [lineFirst1, lineSecond1] = getDirected(second, third1, flip1, 0.5);
			
			return third0.z >= third1.z ?
					[
						[third1.z, getProgressedLine(lineFirst0, third1), lineSecond1],
						[third0.z, lineSecond0, getProgressedLine(lineSecond1, third0)],
					] :
					[
						[third0.z, lineSecond0, getProgressedLine(lineFirst1, third0)],
						[third1.z, getProgressedLine(lineSecond0, third1), lineSecond1],
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

const getRailProgress = (zoom, first, second, third) => {
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
	lines = new Lines(1, this, false, false, true);
	
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
		return getSnappedZoom(...this.zoomPoints.slice(1), this.position);
	}
}
