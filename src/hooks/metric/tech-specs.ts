import {Platform, Dimensions, PixelRatio} from 'react-native';
import type {Batch} from './protobuf/metrics';

const {width, height} = Dimensions.get('window');
const pixelRatio = PixelRatio.get();

enum SwitcherEnum {
	'tablet' = 'tablet',
	'mobile' = 'mobile',
}

let brand = '';
let model = '';
let type = SwitcherEnum.mobile;

if (Platform.OS === 'android') {
	brand = Platform.constants.Brand;
	model = Platform.constants.Model;
}

if (Platform.OS === 'ios') {
	brand = 'Apply';
	model = Platform.constants.systemName;
	if (Platform.isPad) {
		type = SwitcherEnum.tablet;
	}
}

function getTechSpecs(): Batch['techSpecs'] {
	try {
		return {
			device: {
				type: type,
				model: model,
				vendor: brand,
				cPU: {
					arch: '',
					num: 0,
				},
				totalMemory: 0,
			},
			oS: {
				name: Platform.OS,
				version: Platform.Version.toString(),
			},
			screen: {
				width: Math.floor(width * pixelRatio),
				height: Math.floor(height * pixelRatio),
				colorDepth: 24,
			},
		};
	} catch {
		return undefined;
	}
}

export default getTechSpecs();
