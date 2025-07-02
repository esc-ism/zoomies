import Rails from '@/demo/lines/rails';
import Demo, {getAllStartZooms} from '../demo';

import {getTheta, DEGREES} from '@/shared';
import {
	getConstrainerFromPoints, getZoomProgressed, getProgressedLine,
	getIntersectProgress, getProgress,
} from '../shared';

import {CORNERS} from '@/pages/consts';

export const getBound = (zoom, first, second, isTopLeft) => {
	if (zoom > second.z) {
		const progress = zoom / second.z;
		
		return {
			x: isTopLeft ? -0.5 - (-0.5 - second.x) / progress : 0.5 - (0.5 - second.x) / progress,
			y: 0.5 - (0.5 - second.y) / progress,
		};
	}
	
	if (zoom <= first.z || (second.x === 0 && second.y === 0)) {
		return false;
	}
	
	return {
		...getZoomProgressed(first, second.vpEnd, zoom),
		m: second.y / second.x,
		c: 0,
	};
};

export const getSnappedZoom = (() => {
	const getDirected = (first, second, flipX, flipY) => {
		const line0 = [first, {}];
		const line1 = [{z: second.z}, {}];
		
		if (flipX) {
			line0[1].x = -second.vpEnd.x;
			line1[0].x = -second.x;
			line1[1].x = -0.5;
		} else {
			line0[1].x = second.vpEnd.x;
			line1[0].x = second.x;
			line1[1].x = 0.5;
		}
		
		if (flipY) {
			line0[1].y = -second.vpEnd.y;
			line1[0].y = -second.y;
			line1[1].y = -0.5;
		} else {
			line0[1].y = second.vpEnd.y;
			line1[0].y = second.y;
			line1[1].y = 0.5;
		}
		
		return [line0, line1];
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
	
	return (first0, _second0, first1, second1, {x, y}) => {
		const second0 = {..._second0, x: -_second0.x, vpEnd: {..._second0.vpEnd, x: -_second0.vpEnd.x}};
		const absPosition = {x: Math.abs(x), y: Math.abs(y)};
		
		const getPairings = (flipX0, flipY0, flipX1, flipY1) => {
			const [lineFirst0, lineSecond0] = getDirected(first0, second0, flipX0, flipY0);
			const [lineFirst1, lineSecond1] = getDirected(first1, second1, flipX1, flipY1);
			
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
			getZoom(...getPairings(true, false, false, false), absPosition),
			getZoom(...getPairings(false, true, false, false), absPosition, true),
			getZoom(...getPairings(false, false, true, false), absPosition, true),
			getZoom(...getPairings(false, false, false, true), absPosition),
		].filter(isValidZoom));
	};
})();

export const getZoomPoints = (() => {
	const getPoints = (rotation, image, viewport, startZooms, doFlip) => {
		const rightX = viewport.halfWidth / startZooms[0];
		const topY = viewport.halfHeight / startZooms[1];
		
		const rightTheta = DEGREES[90] - rotation;
		const topTheta = rightTheta + DEGREES[90];
		
		return [
			{
				x: rightX * Math.cos(rightTheta) / image.width,
				y: rightX * Math.sin(rightTheta) / image.height,
				axis: doFlip ? 'y' : 'x',
			},
			{
				x: topY * Math.cos(topTheta) / image.width,
				y: topY * Math.sin(topTheta) / image.height,
				axis: doFlip ? 'x' : 'y',
			},
		];
	};
	
	const getIntersection = (viewport, image, line, corner, middle) => {
		const getIntersection = (line0, line1) => {
			const a0 = line0[0].y - line0[1].y;
			const b0 = line0[1].x - line0[0].x;
			const c0 = line0[1].x * line0[0].y - line0[0].x * line0[1].y;
			
			const a1 = line1[0].y - line1[1].y;
			const b1 = line1[1].x - line1[0].x;
			const c1 = line1[1].x * line1[0].y - line1[0].x * line1[1].y;
			
			const d = a0 * b1 - b0 * a1;
			
			return {
				x: (c0 * b1 - b0 * c1) / d,
				y: (a0 * c1 - c0 * a1) / d,
			};
		};
		
		const {x, y} = getIntersection([{x: 0, y: 0}, middle], [line, corner]);
		const progress = (y - line.y) / (corner.y - line.y);
		
		return {x, y, z: line.z / (1 - progress), c: line.y};
	};
	
	const getIntersect = (viewport, image, yIntersect, corner, right, top) => {
		const point0 = getIntersection(viewport, image, yIntersect, corner, right);
		const point1 = getIntersection(viewport, image, yIntersect, corner, top);
		
		const [point, vpEnd] = point0.z > point1.z ? [point0, {...right}] : [point1, {...top}];
		
		// todo do you need to reference the specific axis?
		//  can you just say if either axis' sign isn't equal?
		//  if so get rid of the axis assignments
		if (Math.sign(point[vpEnd.axis]) !== Math.sign(vpEnd[vpEnd.axis])) {
			vpEnd.x = -vpEnd.x;
			vpEnd.y = -vpEnd.y;
		}
		
		const axis = Math.abs(vpEnd.x) > Math.abs(vpEnd.y) ? 'x' : 'y';
		
		return {...point, vpEnd, p: vpEnd[axis] / point[axis]};
	};
	
	// the angle from 0,0 to the center of the image edge angled towards the viewport's upper-right corner
	const getQuadrantAngle = (rotation, isEvenQuadrant) => {
		const angle = (rotation + DEGREES[360]) % DEGREES[90];
		
		return isEvenQuadrant ? angle : DEGREES[90] - angle;
	};
	
	return (rotation, viewport, image, viewportRatio = viewport.width / viewport.height, viewportRatioInverse = 1 / viewportRatio, allStartZooms) => {
		allStartZooms ??= getAllStartZooms(rotation, viewport, image);
		const startZooms = [
			Math.min(allStartZooms[0].x, allStartZooms[1].x),
			Math.min(allStartZooms[0].y, allStartZooms[1].y),
		];
		
		const isEvenQuadrant = Math.floor(rotation / DEGREES[90]) % 2 !== 0;
		const quadrantAngle = getQuadrantAngle(rotation, isEvenQuadrant);
		
		const progress = quadrantAngle / DEGREES[90] * -2 + 1;
		const progressAngles = {
			side: Math.atan(progress * viewportRatioInverse),
			base: Math.atan(progress * viewportRatio),
		};
		
		const points = getPoints(rotation, image, viewport, startZooms, quadrantAngle >= DEGREES[45]);
		
		const sideIntersection = getIntersect(
			viewport,
			image,
			((cornerAngle) => ({
				x: 0,
				y: (image.halfHeight - image.halfWidth * Math.tan(cornerAngle)) / image.height,
				z: viewport.halfWidth / (Math.cos(progressAngles.side) * Math.abs(image.halfWidth / Math.cos(cornerAngle))),
			}))(quadrantAngle + progressAngles.side),
			{x: isEvenQuadrant ? -0.5 : 0.5, y: 0.5},
			...points,
		);
		
		const baseIntersection = getIntersect(
			viewport,
			image,
			((cornerAngle) => ({
				x: 0,
				y: (image.halfHeight - image.halfWidth * Math.tan(cornerAngle)) / image.height,
				z: viewport.halfHeight / (Math.cos(progressAngles.base) * Math.abs(image.halfWidth / Math.cos(cornerAngle))),
			}))(DEGREES[90] - quadrantAngle - progressAngles.base),
			{x: isEvenQuadrant ? 0.5 : -0.5, y: 0.5},
			...points,
		);
		
		const [originSide, originBase] = startZooms.map((z) => ({x: 0, y: 0, z}));
		
		return isEvenQuadrant ?
				[...[originSide, sideIntersection], ...[originBase, baseIntersection]] :
				[...[originBase, baseIntersection], ...[originSide, sideIntersection]];
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
		this.bound0 = getBound(this.zoom, this.zoomPoints[0], this.zoomPoints[1], true);
		this.bound1 = getBound(this.zoom, this.zoomPoints[2], this.zoomPoints[3], false);
		
		return getConstrainerFromPoints(this.imageDimensions, this.bound0, this.bound1);
	}
	
	getZoomPoints() {
		return getZoomPoints(this.rotation, this.viewportDimensions, this.imageDimensions, this.viewportRatio, this.ratioViewportInverse, this.getAllStartZooms());
	}
	
	getSnappedZoom() {
		return getSnappedZoom(...this.zoomPoints, this.position);
	}
}
