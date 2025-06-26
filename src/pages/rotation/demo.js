import Demo from '@/demo';
import Tangents from '@/demo/lines/tangents';
import Bounds from '@/demo/bounds';

import {getTheta} from '@/shared';
import {getRotatedCorners} from './shared';

export default class extends Demo {
	bounds = new Bounds(this);
	tangents = new Tangents(4, this, false, false, true);
	
	setBounds(bounds) {
		this.bounds.set(...bounds);
	}
	
	setTangents(tangents) {
		this.tangents.set(...tangents);
	}
	
	updateImageDimensions(doApply = true) {
		super.updateImageDimensions(false);
		
		const {halfWidth, halfHeight} = this.imageDimensions;
		
		this.cornerDistance = Math.sqrt(Math.pow(halfWidth, 2) + Math.pow(halfHeight, 2));
		this.cornerAngle = getTheta(halfWidth, halfHeight);
		
		if (doApply) {
			this.constrainPosition({ratio: true});
			this.applyPosition();
		}
	}
	
	getRotatedCorners() {
		return getRotatedCorners(
			this.rotation,
			this.cornerDistance,
			this.cornerAngle,
		);
	}
	
	applyZoomPoints() {
		const [constrainer, bounds, tangents] = this.getPositionConstrainer();
		
		this.getConstrainedPosition = constrainer;
		
		this.setBounds(bounds);
		this.setRailsProgress(bounds);
		this.setTangents(tangents);
	}
	
	setZoomPoints() {
		this.zoomPoints = this.getZoomPoints(this.rotation, this.viewportDimensions, this.imageDimensions);
		
		this.setRails();
	}
	
	constrainPosition({ratio, rotation, zoom, position}) {
		let fallthrough = rotation || ratio;
		
		if (fallthrough) {
			this.setZoomPoints();
		}
		
		if (fallthrough || zoom) {
			this.applyZoomPoints();
			
			fallthrough = true;
		}
		
		if (fallthrough || position) {
			this.position = this.getConstrainedPosition(this.position);
		}
	}
	
	constrainZoom() {
		this.zoom = this.getSnappedZoom(...this.zoomPoints, this.position);
		
		this.applyZoomPoints();
	}
}
