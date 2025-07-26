import {getSecond} from '../axisViewport/zoomPoints';
import {getFlipped, getProgress} from '../../shared';

export const isPartialTarget = (secondSide, secondBase, {isEvenQuadrant, image}) => {
	if (image.width > image.height) {
		return secondBase.y < -secondSide.y;
	}
	
	return (secondBase.x < secondSide.x) === isEvenQuadrant;
};

const getGenericIntersection = (line0, line1) => {
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

const replaceVpEnd = (() => {
	/*
			x=(1-lZ/hZ)*(eX-sX)+sX
			
			x-sX=(1-lZ/hZ)*(eX-sX)
			(x-sX)/(1-lZ/hZ)=eX-sX
			(x-sX)/(1-lZ/hZ)+sX=eX
			
			(x-sX)/(eX-sX)=1-lZ/hZ
			lZ/hZ=1-(x-sX)/(eX-sX)
			lZ/(1-(x-sX)/(eX-sX))=hZ
		*/
	const getModdedSecond = (intersection, [second, end], firstZoom, secondZoom) => {
		const z = secondZoom / (1 - (intersection.x - second.x) / (end.x - second.x));
		const zoomProgress = getProgress(firstZoom, z);
		const vpEnd = {x: intersection.x / zoomProgress, y: intersection.y / zoomProgress};
		
		return {
			...intersection,
			vpEnd,
			p: Math.abs(vpEnd.x / intersection.x),
			z,
		};
	};
	
	return (secondSide, secondBase, {isEvenQuadrant, image, startZooms: [firstZoomSide, firstZoomBase]}, force) => {
		const baseLine = [];
		const sideLine = [];
		
		let flipped;
		
		// side is top-left if isEvenQuadrant
		if (image.width > image.height) {
			if (isEvenQuadrant) {
				flipped = Object.assign(secondSide, getFlipped(secondSide));
				
				baseLine.push(secondBase, {x: 0.5, y: 0.5});
				sideLine.push(flipped, {x: 0.5, y: -0.5});
			} else {
				flipped = Object.assign(secondBase, getFlipped(secondBase));
				
				baseLine.push(flipped, {x: 0.5, y: -0.5});
				sideLine.push(secondSide, {x: 0.5, y: 0.5});
			}
		} else {
			baseLine.push(secondBase, {x: isEvenQuadrant ? 0.5 : -0.5, y: 0.5});
			sideLine.push(secondSide, {x: isEvenQuadrant ? -0.5 : 0.5, y: 0.5});
		}
		
		const intersection = getGenericIntersection(baseLine, sideLine);
		
		Object.assign(secondBase, getModdedSecond(intersection, baseLine, firstZoomBase, secondBase.z));
		Object.assign(secondSide, getModdedSecond(intersection, sideLine, firstZoomSide, secondSide.z));
		
		if (flipped) {
			flipped.vpEnd = getFlipped(flipped.vpEnd);
			Object.assign(flipped, getFlipped(flipped));
		}
	};
})();

export default (data, force) => {
	const [secondSide, secondBase] = getSecond(data);
	
	if (force || isPartialTarget(secondSide, secondBase, data)) {
		replaceVpEnd(secondSide, secondBase, data, force);
	}
	
	return [secondSide, secondBase];
};
