import {getTheta} from '@/shared';
import demo from '@/demo';
import Tangents from '@/demo/lines/tangents';
import Bounds from '@/demo/bounds';

const getCornerDistance = ({halfWidth, halfHeight}) => Math.sqrt(Math.pow(halfWidth, 2) + Math.pow(halfHeight, 2));

export const getAllStartZooms = (rotation, viewport, image, radius = getCornerDistance(image), offset = getTheta(image.height, image.width)) => {
	const angle0 = rotation + offset;
	const angle1 = rotation - offset;
	
	return [
		{
			x: viewport.halfWidth / Math.abs(radius * Math.cos(angle0)),
			y: viewport.halfHeight / Math.abs(radius * Math.sin(angle0)),
		},
		{
			x: viewport.halfWidth / Math.abs(radius * Math.cos(angle1)),
			y: viewport.halfHeight / Math.abs(radius * Math.sin(angle1)),
		},
	];
};

export default class {
	bounds = new Bounds();
	tangents = new Tangents(4, false, false, true);
	
	constructor() {
		const setCornerData = () => {
			demo.cornerAngle = Math.atan(demo.ratioImage);
			
			demo.cornerDistance = getCornerDistance(demo.sizesImage);
		};
		
		demo.hooks.ratioChange.add(setCornerData);
		
		setCornerData();
	}
	
	setBounds(bounds) {
		this.bounds.set(...bounds);
	}
	
	setTangents(tangents) {
		this.tangents.set(...tangents);
	}
	
	getAllStartZooms() {
		return getAllStartZooms(demo.rotation, demo.sizesViewport, demo.sizesImage, demo.cornerDistance, demo.cornerAngle);
	}
	
	applyZoomPoints() {
		const [constrainer, bounds, tangents] = this.getPositionConstrainer();
		
		this.getConstrainedPosition = constrainer;
		this.boundValues = bounds;
		
		this.setBounds(bounds);
		this.setRailsProgress(bounds);
		this.setTangents(tangents);
	}
	
	setZoomPoints() {
		this.zoomPoints = this.getZoomPoints();
		
		this.setRails();
	}
	
	constrainPosition({ratio, rotation, zoom, position}) {
		let fallthrough = rotation || ratio;
		
		if (fallthrough) {
			this.setZoomPoints();
		}
		
		if (fallthrough || zoom) {
			this.applyZoomPoints();
			
			fallthrough = true;
		}
		
		if (fallthrough || position) {
			demo.position = this.getConstrainedPosition(demo.position);
		}
	}
	
	constrainZoom() {
		demo.zoom = this.getSnappedZoom(...this.zoomPoints, demo.position);
		
		this.applyZoomPoints();
	}
	
	remove() {
		this.bounds.remove();
		this.rails.remove();
		this.tangents.remove();
	}
}
