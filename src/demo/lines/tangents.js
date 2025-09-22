import Hideables from './copies';

import {setLineStyle} from '../bounds';
import {Line} from './lines';

class Tangent extends Line {
	static template = Line.template.cloneNode();
	
	static {
		setLineStyle(this.template);
	}
	
	set(from, {rotation}) {
		this.show();
		
		// overestimation of √(½imageWidth^2 + ½imageHeight^2)
		super.setHeight(Math.max(1, this.demo.ratioImage) * 100 / this.demo.zoom);
		
		this.setRotation(rotation);
		
		this.setPosition(from);
	}
}

export default class extends Hideables {
	constructor(count, demo, flipX, flipY, flipBoth) {
		super();
		
		const container = demo.constructor.elements.tangents;
		
		for (let i = 0; i < count; ++i) {
			this[i] = new Tangent(demo, flipX, flipY, flipBoth, container);
		}
	}
}
