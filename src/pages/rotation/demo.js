import Demo from '@/demo';

export default class extends Demo {
	setPositionConstrainer() {
		const [constrainer, points, tangents] = this.getPositionConstrainer();
		
		this.getConstrainedPosition = constrainer;
		
		this.constructor.limitDisplay.setLimits(points, tangents);
	}
	
	setLimits(setZoomPoints = true) {
		if (setZoomPoints) {
			this.zoomPoints = this.getZoomPoints(this.rotation, this.viewportDimensions, this.imageDimensions);
		}
		
		this.setPositionConstrainer();
	}
	
	constrainPosition(weight) {
		if (weight <= 1) {
			this.setLimits(weight <= 0);
		}
		
		this.position = this.getConstrainedPosition(this.position);
	}
	
	constrainZoom() {
		this.zoom = this.getSnappedZoom(...this.zoomPoints, this.position);
		
		this.setPositionConstrainer();
	}
}
