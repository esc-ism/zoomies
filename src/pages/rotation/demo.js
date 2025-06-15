import Demo from '@/demo';
import Tangents from '@/demo/lines/tangents';
import Bounds from '@/demo/bounds';

export default class extends Demo {
	bounds = new Bounds(this);
	tangents = new Tangents(4, this, false, false, true);
	
	setBounds() {
		const [constrainer, bounds, tangents] = this.getPositionConstrainer();
		
		this.getConstrainedPosition = constrainer;
		
		this.bounds.set(...bounds);
		this.setRailsProgress(bounds);
		this.tangents.set(...tangents);
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
			this.setBounds();
			
			fallthrough = true;
		}
		
		if (fallthrough || position) {
			this.position = this.getConstrainedPosition(this.position);
		}
	}
	
	constrainZoom() {
		this.zoom = this.getSnappedZoom(...this.zoomPoints, this.position);
		
		this.setBounds();
	}
}
