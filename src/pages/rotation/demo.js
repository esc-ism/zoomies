import Demo from '@/demo';
import Tangents from '@/demo/lines/tangents';
import Bounds from '@/demo/bounds';

import {getTheta} from '@/shared';

const getCornerDistance = ({halfWidth, halfHeight}) => Math.sqrt(Math.pow(halfWidth, 2) + Math.pow(halfHeight, 2));

export const getAllStartZooms = (rotation, viewport, image, radius = getCornerDistance(image), offset = getTheta(image.height, image.width)) => {
	const angle0 = rotation + offset;
	const angle1 = rotation - offset;
	
	return [
		{
			x: viewport.halfWidth / Math.abs(radius * Math.cos(angle0)),
			y: viewport.halfHeight / Math.abs(radius * Math.sin(angle0)),
		},
		{
			x: viewport.halfWidth / Math.abs(radius * Math.cos(angle1)),
			y: viewport.halfHeight / Math.abs(radius * Math.sin(angle1)),
		},
	];
};

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
		
		this.cornerAngle = Math.atan(this.ratioImage);
		this.cornerDistance = getCornerDistance(this.imageDimensions);
		
		if (doApply) {
			this.constrainPosition({ratio: true});
			this.applyPosition();
		}
	}
	
	getAllStartZooms() {
		return getAllStartZooms(this.rotation, this.viewportDimensions, this.imageDimensions, this.cornerDistance, this.cornerAngle);
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
