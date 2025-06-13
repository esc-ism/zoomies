import {setLineStyle} from '../bounds';
import Hideable from './index';
import {Line} from './lines';

import {getLineX, getLineY} from '@/pages/rotation/shared';

const getEnd = ({isHigh, isSide}, line) => {
	if (isSide) {
		return isHigh ? {x: 0.5, y: getLineY(line, 0.5)} : {x: -0.5, y: getLineY(line, -0.5)};
	}
	
	return isHigh ? {y: 0.5, x: getLineX(line, 0.5)} : {y: -0.5, x: getLineX(line, -0.5)};
};

class Tangent extends Line {
	set(from, line, property) {
		super.set(from, getEnd(line, line[property]));
	}
}

export default class extends Hideable {
	constructor(demo, count = 4) {
		super();
		
		for (let i = 0; i < count; ++i) {
			this[i] = new Tangent(demo);
			
			setLineStyle(this[i].element);
			
			demo.elements.imageWrapper.appendChild(this[i].element);
		}
	}
	
	set(tangents) {
		this.hide(tangents.length);
		
		for (const [i, tangent] of tangents.entries()) {
			this[i].set(...tangent);
		}
	}
}
