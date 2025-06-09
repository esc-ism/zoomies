import {getLineX, getLineY} from '@/pages/rotation/shared';

const to = (ctx, x, y, move = false) => {
	ctx[`${move ? 'move' : 'line'}To`]((x + 0.5) * ctx.canvas.width, (0.5 - y) * ctx.canvas.height);
};

const drawPoints = (ctx, points) => {
	const {width, height} = ctx.canvas;
	
	ctx.save();
	
	ctx.fillStyle = 'black';
	ctx.globalAlpha = 0.6;
	
	ctx.beginPath();
	
	ctx.moveTo(0, 0);
	ctx.lineTo(width, 0);
	ctx.lineTo(width, height);
	ctx.lineTo(0, height);
	ctx.closePath();
	
	let doMove = true;
	
	for (const {x, y} of points) {
		to(ctx, x, y, doMove);
		doMove = false;
	}
	
	ctx.closePath();
	ctx.clip('evenodd');
	
	ctx.fillRect(0, 0, width, height);
	
	ctx.restore();
	
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 1;
	
	ctx.beginPath();
	
	for (const {x, y} of points) {
		to(ctx, x, y, doMove);
		doMove = false;
	}
	
	ctx.closePath();
	
	ctx.stroke();
	
	ctx.restore();
};

const drawTangents = (() => {
	const getEnd = ({isHigh, isSide}, line) => {
		if (isSide) {
			return isHigh ? {x: 0.5, y: getLineY(line, 0.5)} : {x: -0.5, y: getLineY(line, -0.5)};
		}
		
		return isHigh ? {y: 0.5, x: getLineX(line, 0.5)} : {y: -0.5, x: getLineX(line, -0.5)};
	};
	
	return (ctx, lines) => {
		ctx.save();
		
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 1;
		
		for (const [{x, y}, line, property] of lines) {
			ctx.beginPath();
			
			to(ctx, x, y, true);
			
			const end = getEnd(line, line[property]);
			
			to(ctx, end.x, end.y, false);
			
			ctx.stroke();
		}
		
		ctx.restore();
	};
})();

export default class {
	element = document.createElement('canvas');
	ctx = this.element.getContext('2d');
	
	constructor() {
		this.element.style.height = '100%';
		this.element.style.width = '100%';
		this.element.style.pointerEvents = 'none';
	}
	
	show(doShow = true) {
		if (doShow) {
			this.element.style.removeProperty('display');
		} else {
			this.element.style.display = 'none';
		}
	}
	
	setDimensions({offsetWidth, offsetHeight}) {
		this.element.width = offsetWidth;
		this.element.height = offsetHeight;
	}
	
	setLimits(points, tangents) {
		this.ctx.clearRect(0, 0, this.element.width, this.element.height);
		
		drawPoints(this.ctx, points);
		
		drawTangents(this.ctx, tangents);
	}
}
