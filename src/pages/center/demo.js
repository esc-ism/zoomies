import {DEGREES} from '@/shared';
import demo from '@/demo';
import Bounds from '@/demo/bounds';
import Tangents from '@/demo/lines/tangents';

export default class {
	bounds = new Bounds();
	tangents = new Tangents(2, true, true, true);
	
	constructor() {
		this.updateBounds();
	}
	
	updateBounds() {
		this.bounds.set({x: -0.5, y: 0.5}, {x: 0.5, y: 0.5}, {x: 0.5, y: -0.5}, {x: -0.5, y: -0.5});
	}
	
	constrainPosition({position, zoom, ratio, ratioImage}) {
		if (position) {
			demo.position.x = Math.max(-0.5, Math.min(0.5, demo.position.x));
			demo.position.y = Math.max(-0.5, Math.min(0.5, demo.position.y));
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
		this.bounds.remove();
		this.tangents.remove();
	}
}
