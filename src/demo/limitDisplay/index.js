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
	element = document.createElement('div');
	background = document.createElement('div');
	// todo remove canvas
	//  replace with div lines like target
	//  width = 1px
	//  filter = drop-shadow(0 0 6px white)
	canvas = document.createElement('canvas');
	ctx = this.canvas.getContext('2d');
	
	constructor() {
		this.element.style.height = this.element.style.width
		= this.background.style.height = this.background.style.width
		= '100%';
		
		this.background.style.position = this.canvas.style.position = 'absolute';
		
		this.element.style.pointerEvents = 'none';
		
		this.background.style.backgroundColor = '#000000a0';
		
		this.element.append(this.background, this.canvas);
	}
	
	#setPoints(points) {
		if (points.length === 0) {
			this.background.style.removeProperty('clip-path');
			
			return;
		}
		
		const path = points.map(({x, y}) => `${x * 100 + 50}% ${50 - y * 100}%`);
		
		this.background.style.clipPath = `polygon(0 0, 0 100%, 100% 100%, 100% 0, 0 0, ${[...path, path[0]].join(',')})`;
	}
	
	show(doShow = true) {
		if (doShow) {
			this.canvas.style.removeProperty('display');
			this.background.style.removeProperty('display');
		} else {
			this.canvas.style.display = this.background.style.display = 'none';
		}
	}
	
	setDimensions({offsetWidth, offsetHeight}) {
		this.canvas.width = offsetWidth;
		this.canvas.height = offsetHeight;
	}
	
	setLimits(points, tangents) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.#setPoints(points);
		
		drawTangents(this.ctx, tangents);
	}
}
