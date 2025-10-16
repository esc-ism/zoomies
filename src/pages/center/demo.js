import Demo from '@/demo';
import Bounds from '@/demo/bounds';
import tangents from '@/demo/lines/tangents';
import {DEGREES} from '@/shared';

export default class extends Demo {
	bounds = new Bounds(this);
	tangents = new tangents(2, this, true, true, true);
	
	constructor() {
		super();
		
		this.updateBounds();
	}
	
	updateBounds() {
		this.bounds.set({x: -0.5, y: 0.5}, {x: 0.5, y: 0.5}, {x: 0.5, y: -0.5}, {x: -0.5, y: -0.5});
	}
	
	constrainPosition({position, zoom, ratio, ratioImage}) {
		if (position) {
			this.position.x = Math.max(-0.5, Math.min(0.5, this.position.x));
			this.position.y = Math.max(-0.5, Math.min(0.5, this.position.y));
		}
		
		if (zoom || ratio) {
			this.tangents.set(
				[{x: 0.5, y: 0.5}, {rotation: DEGREES[90]}],
				[{x: 0.5, y: 0.5}, {rotation: 0}],
			);
			
			if (ratioImage) {
				this.updateBounds();
			}
		}
	}
	
	constrainZoom() {}
	
	remove() {
		super.remove();
		
		this.bounds.remove();
		this.tangents.remove();
	}
}
