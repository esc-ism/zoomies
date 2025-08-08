import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	// demo.init().then(() => {
	// 	demo.rotation = DEGREES[90] - (33 / 180 * DEGREES[180]);
	// 	demo.constrainRotation();
	// 	demo.applyRotation();
	// 	demo.ratioImage = 1.24;
	// 	demo.ratioViewport = 1.5;
	// });
	
	// demo.init().then(() => {
	// 	demo.rotation = -1.8353515172328656;
	// 	demo.constrainRotation();
	// 	demo.applyRotation();
	// 	demo.ratioImage = 0.8619439291037211;
	// 	demo.ratioViewport = 0.9043357090012468;
	// });
	
	demo.init().then(() => {
		demo.rotation = -0.41975028989160157;
		demo.constrainRotation();
		demo.applyRotation();
		demo.ratioImage = 1.0748632597755585;
		demo.ratioViewport = 0.9728458295664878;
		
		demo.position = {x: 0.01, y: 0.01};
		demo.constrainZoom();
		demo.applyPosition();
		demo.applyZoom();
	});
	
	// demo.init().then(() => {
	// 	demo.rotation = -0.14671727350745445;
	// 	demo.constrainRotation();
	// 	demo.applyRotation();
	// 	demo.ratioImage = 0.7471547269194987;
	// 	demo.ratioViewport = 0.9728458295664878;
	// });
	
	wrapper.append(
		demo.element,
		getText(
			{
				tag: 'h1',
				content: 'Triple-Line Rotation',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Snap-Pan Effectiveness',
				style: {textAlign: 'center'},
			},
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
		),
	);
	
	return demo;
};
