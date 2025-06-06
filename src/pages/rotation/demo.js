import Demo from '@/demo';

export default class extends Demo {
	setPositionConstrainer() {
		const [constrainer, points, tangents] = this.getPositionConstrainer();
		
		this.getConstrainedPosition = constrainer;
		
		this.constructor.limitDisplay.setLimits(points, tangents);
	}
	
	constrainPosition(weight) {
		if (weight <= 0) {
			this.zoomPoints = this.getZoomPoints(this.rotation, this.viewportDimensions, this.imageDimensions);
			
			for (const point of this.zoomPoints) {
				if (Math.abs(point.z - 1) <= Number.EPSILON) {
					point.z = 1;
				}
			}
		}
		
		if (weight <= 1) {
			this.setPositionConstrainer();
		}
		
		this.position = this.getConstrainedPosition(this.position);
	}
	
	constrainZoom() {
		this.zoom = this.getSnappedZoom(...this.zoomPoints, this.position);
		
		this.setPositionConstrainer();
	}
}
