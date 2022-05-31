import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const KEY_CLIENT_ID = 'kinescope:clientId';

export async function getClientId() {
	const id = await AsyncStorage.getItem(KEY_CLIENT_ID);
	if (id) {
		return id;
	}

	const clientId = uuid.v4().toString();
	await AsyncStorage.setItem('KEY_CLIENT_ID', clientId);

	return clientId;
}
