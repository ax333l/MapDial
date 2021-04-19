import * as Permissions from 'expo-permissions'


export async function getNotificationPermission() {
    const { status } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
    );
    if (status !== 'granted') {
        await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
}

export async function getLocationPermission() {
    const { status } = await Permissions.getAsync(
        Permissions.LOCATION
    );
    if (status !== 'granted') {
        await Permissions.askAsync(Permissions.LOCATION);
    }
}