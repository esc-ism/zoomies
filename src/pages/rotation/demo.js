import Demo from '../demo';

export default class extends Demo {
	setPositionConstrainer() {
		const [constrainer, bounds, tangents] = this.getPositionConstrainer();
		
		this.getConstrainedPosition = constrainer;
		
		this.constructor.bounds.set(this, ...bounds);
		this.setRails(bounds);
		this.tangents.set(tangents);
	}
	
	setBounds(setZoomPoints = true) {
		if (setZoomPoints) {
			this.zoomPoints = this.getZoomPoints(this.rotation, this.viewportDimensions, this.imageDimensions);
		}
		
		this.setPositionConstrainer();
	}
	
	constrainPosition(weight) {
		if (weight <= 1) {
			this.setBounds(weight <= 0);
		}
		
		this.position = this.getConstrainedPosition(this.position);
	}
	
	constrainZoom() {
		this.zoom = this.getSnappedZoom(...this.zoomPoints, this.position);
		
		this.setPositionConstrainer();
	}
}
