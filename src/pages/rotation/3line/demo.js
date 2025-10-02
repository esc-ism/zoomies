import Rails from '@/demo/lines/rails';
import Demo from '../demo';

import {getZoomProgressed, getProgressedLine, getZoomPairSecond, getProgress, getFlipped} from '../shared';
import getConstrainerFromPoints from '../shared/constrain';

import getZoomPoints from './zoomPoints';
import {getRailProgress as getFirstIntRailProgress} from '../2line/demo';
import * as mock from '../mock';

export const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

export const getBound = (zoom, first, second, third) => {
	if (zoom <= first.z) {
		return false;
	}
	
	if (zoom <= third.z) {
		if (third.isFirstInt || zoom <= second.z) {
			return {
				...getZoomProgressed(first, first.end, zoom),
				axis: first.end.axis,
				isFirst: true,
			};
		}
		
		return {...getZoomProgressed(second, second.end, zoom), axis: second.axis, isFirst: true};
	}
	
	const progress = zoom / third.z;
	
	return {
		x: third.end.x - (third.end.x - third.x) / progress,
		y: third.end.y - (third.end.y - third.y) / progress,
	};
};

export const getSnappedZoom = (() => {
	const getDirected = (first, second, third, flip, cornerX) => {
		const get = flip ? (position) => getFlipped(position) : ({...position}) => ({...position});
		const low = third.isFirstInt ? first : second;
		
		return [[get(low), get(low.end)], [{...get(third), z: third.z}, get({x: cornerX, y: 0.5})]];
	};
	
	const isValidZoom = (zoom) => zoom !== null && !isNaN(zoom);
	
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
			const [lineFirst0, lineSecond0] = getDirected(first0, second0, third0, flip0, -0.5);
			const [lineFirst1, lineSecond1] = getDirected(first1, second1, third1, flip1, 0.5);
			
			const pairings = third0.z >= third1.z ?
					[
						[third1.z, getProgressedLine(lineFirst0, third1), lineSecond1],
						[third0.z, lineSecond0, getProgressedLine(lineSecond1, third0)],
					] :
					[
						[third0.z, lineSecond0, getProgressedLine(lineFirst1, third0)],
						[third1.z, getProgressedLine(lineSecond0, third1), lineSecond1],
					];
			
			if (third0.isFirstInt) {
				pairings.unshift([second1.z, getProgressedLine(lineFirst0, second1), lineSecond1]);
			} else if (third1.isFirstInt) {
				pairings.unshift([second0.z, lineSecond0, getProgressedLine(lineFirst1, second0)]);
			} else if (second0.axis || second1.axis) {
				pairings.unshift([second1.z, lineFirst0, lineFirst1]);
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
	if (third.isFirstInt) {
		return getFirstIntRailProgress(zoom, first, third);
	}
	
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

const getRails = (second, third) => {
	if (third.isFirstInt) {
		return [[{x: 0, y: 0}, third], [third, third.end]];
	}
	
	return [[{x: 0, y: 0}, second], [second, third], [third, third.end]];
};

export default class extends Demo {
	static getZoomPoints = getZoomPoints;
	
	rails = new Rails(6, this, false, false, true);
	
	setRails() {
		this.rails.set(
			...getRails(this.zoomPoints[1], this.zoomPoints[2]),
			...getRails(this.zoomPoints[4], this.zoomPoints[5]),
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
			this.ratioImage,
		);
	}
	
	getZoomPoints() {
		return this.constructor.getZoomPoints(this, this.getAllStartZooms());
	}
	
	getSnappedZoom() {
		return getSnappedZoom(
			this.zoomPoints[0], this.zoomPoints[1], this.zoomPoints[2],
			this.zoomPoints[3], this.zoomPoints[4], this.zoomPoints[5],
			this.position,
		);
	}
}
