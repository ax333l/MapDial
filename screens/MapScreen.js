import React, { useRef, useContext } from 'react';
import { Marker, Callout, PROVIDER_GOOGLE, ProviderPropType } from 'react-native-maps';
import * as Permissions from 'expo-permissions'
import * as Notifications from 'expo-notifications'
import * as Location from 'expo-location'
import MapView from 'react-native-map-clustering'
import AsyncStorage from '@react-native-community/async-storage'
import * as Animatable from 'react-native-animatable';
import { format, parseISO } from 'date-fns'
import * as TaskManager from 'expo-task-manager';
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { getCenter, getDistance, isPointInPolygon } from 'geolib';
import io from 'socket.io-client';
import { AuthContext } from '../components/context'
import { setI18nConfig, translate } from '../components/localize'

function withMyHook(Component) {
    return function WrappedComponent(props) {
      const mapRef = useRef();
      const { signOut } = useContext(AuthContext)
      return <Component {...props} mapRef={mapRef} signOut={signOut}/>;
    }
  }

import { 
    View, 
    Text,
    Alert,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Animated,
    TouchableOpacity,
    Image,
    ImageBackground,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import styles from './styles'
import config from '../config/settings'
import { Button } from 'react-native-paper';

const desc = (description) => {
    if(description.length>150){
        return description.substring(0,150)+'...'
    }
    else{
        return description
    }
}

async function getNotificationPermission() {
    const { status } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
    );
    if (status !== 'granted') {
        await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
}

async function getLocationPermission() {
    const { status } = await Permissions.getAsync(
        Permissions.LOCATION
    );
    if (status !== 'granted') {
        await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
}

const LOCATION_TASK_NAME = 'background-location-task';

class MapScreen extends React.Component {

    constructor(props){
        super(props)
        setI18nConfig();

        this.state = {
            authToken: null,
            markers: null,
            name: null,
            description: null,
            date: null,
            author: null,
            public: null,
            key: null,
            pushToken: null,
            visiable: false,
            visiableMoreinfo: false,
            region: {
                latitude: 37,
                longitude: -122,
                longitudeDelta: 0.0421,
                latitudeDelta: 0.0922
            },
            error: null,
            mapStyle: null,
            isLoading: true,
            isRegion: true,
            currentname: null,
            img: [],
            analyse: null,
            isAdmin: false
        }
        
        this.navigateToMarkerEdit = this.navigateToMarkerEdit.bind(this)

    }
    async UNSAFE_componentWillMount(){
        const mapRef = this.props.mapRef
        getNotificationPermission()
        //getLocationPermission()
        this.animation = new Animated.Value(0);
        Notifications.addListener(notification => {
            if(notification.origin === 'selected'){
                mapRef.current.animateToRegion({
                    latitude: notification.data.latitude,
                    longitude: notification.data.longitude,
                    latitudeDelta: 0.0045,
                    longitudeDelta: 0.0017
                },2000)
                this.setState({visiable: true,name:notification.data.name,description:notification.data.description,date: notification.data.dateCreated, author:notification.data.createdBy, public: notification.data.publicin, img: notification.data.img})
            }
        })
        this._getLocationAsync()
        Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000*10,
            distanceInterval: 10
        });
    }
    async componentDidMount(){
        setInterval(async () => {
            const latitude = await AsyncStorage.getItem("latitude")
            const longitude = await AsyncStorage.getItem("longitude")
            if(Number(latitude)!==this.state.region.latitude&&Number(longitude)!==this.state.region.longitude&&latitude!==null&&longitude!==null&&latitude!==''){
                let markers = []
                this.state.analyse.map(async marker => {
                    if(isPointInPolygon({latitude: Number(latitude), longitude: Number(longitude)}, marker.polygon)){
                        markers.push({
                            operationName: 'in',
                            variables: {
                                marker: marker,
                                name: this.state.currentname,
                                position: {
                                    latitude: Number(latitude),
                                    longitude: Number(longitude)
                                }
                            }
                        })
                    }
                    else{
                        markers.push({
                            operationName: 'out',
                            variables: {
                                marker: marker,
                                name: this.state.currentname,
                                position: {
                                    latitude: Number(latitude),
                                    longitude: Number(longitude)
                                },
                                m_away: getDistance(getCenter(marker.polygon), { latitude: Number(latitude), longitude: Number(longitude) })
                            }
                        })
                    }
                })
                await fetch(config.server+'api/public/processAnalytic', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-access-token': this.state.authToken
                    },
                    body: JSON.stringify(markers)
                })
                this.setState({
                    region: {
                        latitude: Number(latitude),
                        longitude: Number(longitude),
                        longitudeDelta: 0.0421,
                        latitudeDelta: 0.0922,
                    }
                })
            }
        }, 60*1000);
        const removeMarker = (markerid) => {
            const markers = this.state.markers.filter(item => item._id !== markerid);
            this.setState({ markers: markers });
        };
        let authToken
        try {
            authToken = await AsyncStorage.getItem('userToken');
            this.setState({authToken: authToken})
        } catch(e) {
            console.log(e);
        }
        this.socket = io(config.server);
        const res = await fetch(config.server+'api/users/current', {
            method: 'GET',
            headers: {
                'x-access-token': authToken
            }
        })
        .then(response => response.json())
        if(!res.name){
            const signOut = this.props.signOut
            signOut()
        }
        this.setState({
            mapStyle: res.mapStyle,
            currentname: res.name
        })
        this.socket.emit('join', res.name)
        this.socket.on('newMarker', (marker) => {
            this.setState({
                markers: [...this.state.markers, marker]
            })
            let notif = false
            let distance
            if((typeof marker.notificationrange).toString() === 'string'){
                distance = getDistance({latitude: this.state.region.latitude, longitude: this.state.region.longitude},{latitude: marker.latitude, longitude: marker.longitude})
                if(distance<=marker.notificationrange||marker.notificationrange===null) notif=true
            }
            else if((typeof marker.notificationrange).toString() === 'object'&&marker.notificationrange!==null){
                distance = getDistance({latitude: this.state.region.latitude, longitude: this.state.region.longitude},{latitude: marker.latitude, longitude: marker.longitude})
                notif=isPointInPolygon({latitude: this.state.region.latitude,longitude: this.state.region.longitude},marker.notificationrange)
                console.log(notif)
            }
            if(notif){
                const localNotification = {
                    title: translate('newMarker.message')+distance+translate('newMarker.description2'),
                    body: marker.name+translate('newMarker.description1')+marker.publicin,
                    data: marker
                };

                const schedulingOptions = {
                    time: new Date().getTime()+100,
                };

                Notifications.scheduleLocalNotificationAsync(
                    localNotification, schedulingOptions
                )
                showMessage({
                    message: translate('newMarker.message')+marker.publicin,
                    description: marker.name+translate('newMarker.description1')+distance+translate('newMarker.description2'),
                    type: "info"
                })
            }
        })
        this.socket.on('updateMarker', (marker) => {
            const index = this.state.markers.findIndex(x => x._id.toString() === marker._id.toString())
            let newMarker = [...this.state.markers]
            newMarker[index] = marker
            if(this.state.key.toString()===marker._id.toString()){
                this.setState({name: marker.name, description: marker.description, date: marker.dateCreated, author: marker.createdBy, public: marker.publicin, img: marker.img, key: marker._id, color: marker.pinColor, latitude: marker.latitude, longitude: marker.longitude}) 
            }
            this.setState({markers: newMarker})
        })
        this.socket.on('removeMarker', (markerid) => {
            removeMarker(markerid)
        })
        await fetch(config.server+'api/public/getAllAnalyseMarkers', {
            method: 'GET',
            headers: {
                'x-access-token': authToken
            }
        })
        .then(response => response.json())
        .then(response => {
            this.setState({analyse: response})
            let markers = []
            this.state.analyse.map(async marker => {
                if(isPointInPolygon({latitude: this.state.region.latitude, longitude: this.state.region.longitude}, marker.polygon)){
                    markers.push({
                        operationName: 'in',
                        variables: {
                            marker: marker,
                            name: this.state.currentname,
                            position: {
                                latitude: this.state.region.latitude,
                                longitude: this.state.region.longitude
                            }
                        }
                    })
                }
                else{
                    markers.push({
                        operationName: 'out',
                        variables: {
                            marker: marker,
                            name: this.state.currentname,
                            position: {
                                latitude: this.state.region.latitude,
                                longitude: this.state.region.longitude
                            },
                            m_away: getDistance(getCenter(marker.polygon), { latitude: this.state.region.latitude, longitude: this.state.region.longitude })
                        }
                    })
                }
            })
            fetch(config.server+'api/public/processAnalytic', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-access-token': this.state.authToken
                },
                body: JSON.stringify(markers)
            })
        })
        return await fetch(config.server+'api/public/getAllMarkers', {
            method: 'GET',
            headers: {
                'x-access-token': authToken
            }
        })
        .then(response => response.json())
        .then((responseJson) => {
            if(responseJson.error){
                this.setState({
                    error: responseJson.error
                })
            }
            this.setState({
                isLoading: false,
                markers: responseJson
            })
        })
    }

    handleRemoveMarker = async () => {
        this.setState({isLoading: true})
        fetch(config.server+'api/public/removeMarker', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.state.authToken
            },
            body: JSON.stringify({
                publicid: this.state.public,
                id: this.state.key
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response.error){
                this.setState({isLoading: false})
                return(
                    showMessage({
                        message: translate('error'),
                        description: response.error,
                        type: "error"
                    })
                )
            }
            else{
                this.setState({isLoading: false, visiable: false, visiableMoreinfo: false})
                return(
                    showMessage({
                        message: translate('success'),
                        description: response.success,
                        type: "success"
                    })
                )
            }
        })
    }
    
    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION)
        if(status!=='granted'){
            showMessage({
                message: translate('error'),
                description: 'Permission denied',
                type: "error"
            })
            this.setState({
                error: 'Permission to access location was denied'
            })
        }
        let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true, timeout: 30000, maximumAge: 1000})
        this.setState({
            region: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                longitudeDelta: 0.0421,
                latitudeDelta: 0.0922
            }
        })
        this.setState({isRegion:false})
    }

    isAdmin = async (id) => {
        return await fetch(config.server+'api/public/isAdmin', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.state.authToken
            },
            body: JSON.stringify({id: id})
        })
        .then(response => response.json())
        .then(response => {
            if(response.isAdmin===true){
                this.setState({isAdmin: true})
            }
            else{
                this.setState({isAdmin: false})
            }
        })
    }

    navigateToMarkerEdit = (color, publicin, latitude, longitude) => {
        this.props.navigation.navigate('CreateMarker', {authToken: this.state.authToken, markerid: this.state.key, isEdit: true, region: {latitude: latitude, longitude: longitude, latitudeDelta: this.state.region.latitudeDelta, longitudeDelta: this.state.region.longitudeDelta}, mapStyle: this.state.mapStyle, photo: this.state.img, marker: {color: color, name: this.state.name, description: this.state.description, publicin: publicin}})
    }

    handleMapStyle = async (mapStyle) => {
        return await fetch(config.server+'api/users/setTheme', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.state.authToken
            },
            body: JSON.stringify({
                mapStyle: mapStyle
            })
        })
        .then(response => response.json())
        .then((responseJson) => {
            if(responseJson.error){
                this.setState({
                    error: responseJson.error
                })
            }
            this.setState({
                mapStyle: mapStyle
            })
        })
    }

    render() {
        const DeleteAlert = () =>
        Alert.alert(
            translate('markerdelete'),
            translate('deleteconfirm'),
            [
                {
                text: translate('cancel'),
                onPress: () => showMessage({type: "info",message: translate('deletecancel')}),
                style: "cancel"
                },
                { text: "OK", onPress: () => this.handleRemoveMarker()}
            ],
            { cancelable: false }
        );

        const OverlayComponent = ({ name, description }) => (
            <Animatable.View style={styles.overlayComponent} animation="fadeIn" duration={1000}>
                <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 20}}>{name}</Text>
                {description ? <Text>{desc(description)}</Text> : null }
                <Button onPress={async () => {
                    await this.isAdmin(this.state.public)
                    this.setState({visiable: false, visiableMoreinfo: true})
                    }}>{translate('more info')}</Button>
            </Animatable.View>
          );
        const OverlayMoreinfo = ({ name, description, date, author, Public, img, color, latitude, longitude}) => (
            <Animatable.View style={styles.overlayMoreinfo} animation="fadeIn" duration={500}>
                <Button onPress={() => this.setState({visiableMoreinfo: false, visiable: false})}>{translate('close')}</Button>
                { this.state.isAdmin ? ( 
                    <View>
                        <Button onPress={() => this.navigateToMarkerEdit(color,Public,latitude,longitude)}>{translate('edit')}</Button>
                        <Button onPress={DeleteAlert}>{translate('delete')}</Button>
                    </View>
                ) : null}
                <ScrollView>
                    <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 20}}>{name}</Text>
                    <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 12}}>{format(parseISO(date),'yyyy-MM-dd H:m')}</Text>
                    {description ? <Text>{description}</Text> : null }
                    {img ? (
                    <ScrollView horizontal={true} style={{flex: 1}}>
                        { img.map((img, i) => {return(
                            <Image source={{uri: config.server+'image/'+img.link}} style={{ flex: 1, margin: 5, width: 200, height: 200 }} key={i}></Image>
                        )})}
                    </ScrollView>
                    ) : null}
                </ScrollView>
                <Text style={{textAlign: "center",fontWeight:"bold",fontSize: 20}}>{translate('author')}: </Text><Button onPress={() => this.props.navigation.navigate('UserInfo',{name:author,authToken:this.state.authToken})}>{author}</Button>
                <Text style={{textAlign: "center",fontWeight:"bold",fontSize: 20}}>{translate('public')}: </Text><Button onPress={() => this.props.navigation.navigate('PublicInfo',{id:Public,authToken:this.state.authToken})}>{Public}</Button>
            </Animatable.View>
        )
        
    if(this.state.isLoading||this.state.isRegion){
        return(
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Image
                source={require('../assets/loading.gif')}
                >
                </Image>
            </View>
        );
    }
    if(this.state.error){
        showMessage({
            message: translate('error'),
            description: this.state.error,
            type: "error"
        })
    }

    if(this.state.mapStyle===null){
        return(
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <TouchableOpacity style={{alignItems: "center",flexDirection:"row",backgroundColor: '#dc4e41'}} activeOpacity={0.5} onPress={() => this.handleMapStyle('Retro')}>
                <ImageBackground
            source={{
              uri:
                'https://maps.googleapis.com/maps/api/staticmap?center=-33.9775,151.036&zoom=13&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0xebe3cd&style=element:labels%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x523735&style=element:labels.text.stroke%7Ccolor:0xf5f1e6&style=feature:administrative%7Celement:geometry.stroke%7Ccolor:0xc9b2a6&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.land_parcel%7Celement:geometry.stroke%7Ccolor:0xdcd2be&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xae9e90&style=feature:administrative.neighborhood%7Cvisibility:off&style=feature:landscape.natural%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:poi%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x93817c&style=feature:poi.park%7Celement:geometry.fill%7Ccolor:0xa5b076&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x447530&style=feature:road%7Celement:geometry%7Ccolor:0xf5f1e6&style=feature:road.arterial%7Celement:geometry%7Ccolor:0xfdfcf8&style=feature:road.highway%7Celement:geometry%7Ccolor:0xf8c967&style=feature:road.highway%7Celement:geometry.stroke%7Ccolor:0xe9bc62&style=feature:road.highway.controlled_access%7Celement:geometry%7Ccolor:0xe98d58&style=feature:road.highway.controlled_access%7Celement:geometry.stroke%7Ccolor:0xdb8555&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x806b63&style=feature:transit.line%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:transit.line%7Celement:labels.text.fill%7Ccolor:0x8f7d77&style=feature:transit.line%7Celement:labels.text.stroke%7Ccolor:0xebe3cd&style=feature:transit.station%7Celement:geometry%7Ccolor:0xdfd2ae&style=feature:water%7Celement:geometry.fill%7Ccolor:0xb9d3c2&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x92998d&size=164x132&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&scale=2',
            }}
            style={{height:100,width:264,resizeMode:"stretch"}}
            ></ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity style={{alignItems: "center",flexDirection:"row",backgroundColor: '#dc4e41'}} activeOpacity={0.5} onPress={() => this.handleMapStyle('Standard')}>
                <ImageBackground
            source={{
              uri:
              'https://maps.googleapis.com/maps/api/staticmap?center=-33.9775,151.036&zoom=13&format=png&maptype=roadmap&style=element:labels%7Cvisibility:off&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.neighborhood%7Cvisibility:off&size=164x132&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&scale=2'
            }}
            style={{height:100,width:264,resizeMode:"stretch"}}
            ></ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity style={{alignItems: "center",flexDirection:"row",backgroundColor: '#dc4e41'}} activeOpacity={0.5} onPress={() => this.handleMapStyle('Silver')}>
                <ImageBackground
            source={{
              uri:
              'https://maps.googleapis.com/maps/api/staticmap?center=-33.9775,151.036&zoom=13&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0xf5f5f5&style=element:labels%7Cvisibility:off&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x616161&style=element:labels.text.stroke%7Ccolor:0xf5f5f5&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xbdbdbd&style=feature:administrative.neighborhood%7Cvisibility:off&style=feature:poi%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:poi.park%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:road%7Celement:geometry%7Ccolor:0xffffff&style=feature:road.arterial%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:road.highway%7Celement:geometry%7Ccolor:0xdadada&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:transit.line%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:transit.station%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:water%7Celement:geometry%7Ccolor:0xc9c9c9&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&size=164x132&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&scale=2'
            }}
            style={{height:100,width:264,resizeMode:"stretch"}}
            ></ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity style={{alignItems: "center",flexDirection:"row",backgroundColor: '#dc4e41'}} activeOpacity={0.5} onPress={() => this.handleMapStyle('Dark')}>
                <ImageBackground
            source={{
              uri:
              'https://maps.googleapis.com/maps/api/staticmap?center=-33.9775,151.036&zoom=13&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0x212121&style=element:labels%7Cvisibility:off&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x757575&style=element:labels.text.stroke%7Ccolor:0x212121&style=feature:administrative%7Celement:geometry%7Ccolor:0x757575&style=feature:administrative.country%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.locality%7Celement:labels.text.fill%7Ccolor:0xbdbdbd&style=feature:administrative.neighborhood%7Cvisibility:off&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:poi.park%7Celement:geometry%7Ccolor:0x181818&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:poi.park%7Celement:labels.text.stroke%7Ccolor:0x1b1b1b&style=feature:road%7Celement:geometry.fill%7Ccolor:0x2c2c2c&style=feature:road%7Celement:labels.text.fill%7Ccolor:0x8a8a8a&style=feature:road.arterial%7Celement:geometry%7Ccolor:0x373737&style=feature:road.highway%7Celement:geometry%7Ccolor:0x3c3c3c&style=feature:road.highway.controlled_access%7Celement:geometry%7Ccolor:0x4e4e4e&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:transit%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:water%7Celement:geometry%7Ccolor:0x000000&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x3d3d3d&size=164x132&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&scale=2'
            }}
            style={{height:100,width:264,resizeMode:"stretch"}}
            ></ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity style={{alignItems: "center",flexDirection:"row",backgroundColor: '#dc4e41'}} activeOpacity={0.5} onPress={() => this.handleMapStyle('Night')}>
                <ImageBackground
            source={{
              uri:
              'https://maps.googleapis.com/maps/api/staticmap?center=-33.9775,151.036&zoom=13&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0x242f3e&style=element:labels%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x746855&style=element:labels.text.stroke%7Ccolor:0x242f3e&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.locality%7Celement:labels.text.fill%7Ccolor:0xd59563&style=feature:administrative.neighborhood%7Cvisibility:off&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0xd59563&style=feature:poi.park%7Celement:geometry%7Ccolor:0x263c3f&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x6b9a76&style=feature:road%7Celement:geometry%7Ccolor:0x38414e&style=feature:road%7Celement:geometry.stroke%7Ccolor:0x212a37&style=feature:road%7Celement:labels.text.fill%7Ccolor:0x9ca5b3&style=feature:road.highway%7Celement:geometry%7Ccolor:0x746855&style=feature:road.highway%7Celement:geometry.stroke%7Ccolor:0x1f2835&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0xf3d19c&style=feature:transit%7Celement:geometry%7Ccolor:0x2f3948&style=feature:transit.station%7Celement:labels.text.fill%7Ccolor:0xd59563&style=feature:water%7Celement:geometry%7Ccolor:0x17263c&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x515c6d&style=feature:water%7Celement:labels.text.stroke%7Ccolor:0x17263c&size=164x132&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&scale=2'
            }}
            style={{height:100,width:264,resizeMode:"stretch"}}
            ></ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity style={{alignItems: "center",flexDirection:"row",backgroundColor: '#dc4e41'}} activeOpacity={0.5} onPress={() => this.handleMapStyle('Aubergine')}>
                <ImageBackground
            source={{
              uri:
              'https://maps.googleapis.com/maps/api/staticmap?center=-33.9775,151.036&zoom=13&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0x1d2c4d&style=element:labels%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x8ec3b9&style=element:labels.text.stroke%7Ccolor:0x1a3646&style=feature:administrative.country%7Celement:geometry.stroke%7Ccolor:0x4b6878&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0x64779e&style=feature:administrative.neighborhood%7Cvisibility:off&style=feature:administrative.province%7Celement:geometry.stroke%7Ccolor:0x4b6878&style=feature:landscape.man_made%7Celement:geometry.stroke%7Ccolor:0x334e87&style=feature:landscape.natural%7Celement:geometry%7Ccolor:0x023e58&style=feature:poi%7Celement:geometry%7Ccolor:0x283d6a&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x6f9ba5&style=feature:poi%7Celement:labels.text.stroke%7Ccolor:0x1d2c4d&style=feature:poi.park%7Celement:geometry.fill%7Ccolor:0x023e58&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x3C7680&style=feature:road%7Celement:geometry%7Ccolor:0x304a7d&style=feature:road%7Celement:labels.text.fill%7Ccolor:0x98a5be&style=feature:road%7Celement:labels.text.stroke%7Ccolor:0x1d2c4d&style=feature:road.highway%7Celement:geometry%7Ccolor:0x2c6675&style=feature:road.highway%7Celement:geometry.stroke%7Ccolor:0x255763&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0xb0d5ce&style=feature:road.highway%7Celement:labels.text.stroke%7Ccolor:0x023e58&style=feature:transit%7Celement:labels.text.fill%7Ccolor:0x98a5be&style=feature:transit%7Celement:labels.text.stroke%7Ccolor:0x1d2c4d&style=feature:transit.line%7Celement:geometry.fill%7Ccolor:0x283d6a&style=feature:transit.station%7Celement:geometry%7Ccolor:0x3a4762&style=feature:water%7Celement:geometry%7Ccolor:0x0e1626&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x4e6d70&size=164x132&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&scale=2'
            }}
            style={{height:100,width:264,resizeMode:"stretch"}}
            ></ImageBackground>
                </TouchableOpacity>
            </View>
        )
    }

    const { markers } = this.state

    const mapRef = this.props.mapRef

    return (
        <View style={{flex: 1}}>
        <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{flex: 1}}
            showsUserLocation={true}
            customMapStyle={config.theme[0][this.state.mapStyle]}
            initialRegion={
            this.state.region
            }
            onPress={() => {this.setState({visiable: false, visiableMoreinfo: false})}}
            >
        {markers.map((marker) => {
            return(
            <Marker coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude       
            }}
            key={marker._id}
            pinColor={marker.pinColor}
            onPress={(e) => {
                e.stopPropagation(); 
                this.setState({name: marker.name, description: marker.description, visiable: true, date: marker.dateCreated, author: marker.createdBy, public: marker.publicin, img: marker.img, key: marker._id, color: marker.pinColor, latitude: marker.latitude, longitude: marker.longitude}) }}
            >
            </Marker>
            )
        })}
        </MapView>
        <View style={{opacity: 1,position: "absolute",bottom:10,right:10}}>
        <TouchableOpacity
   style={{
       borderWidth:1,
       borderColor:'rgba(0,0,0,0.2)',
       alignItems:'center',
       justifyContent:'center',
       width:80,
       height:80,
       backgroundColor:'#fff',
       borderRadius:50,
     }}
     onPress={() => this.props.navigation.navigate('CreateScreen',{authToken:this.state.authToken,region:this.state.region,name:this.state.currentname,mapStyle:this.state.mapStyle})}
 >
    <Icon name={"plus"}  size={30} color="#01a699" />
 </TouchableOpacity>
        </View>
        <View style={{opacity: 1,position: 'absolute', top: 20, left: 0, right: 0, bottom: 0, alignItems: 'center'}}>
        <TouchableOpacity
   style={{
       borderWidth:1,
       borderColor:'rgba(0,0,0,0.2)',
       alignItems:'center',
       justifyContent:'center',
       width:30,
       height:30,
       backgroundColor:'#fff',
       borderRadius:50,
     }}
     onPress={() => this.setState({
         mapStyle: null
     })}
 >
    <Icon name={"globe"}  size={30} color="#01a699" />
 </TouchableOpacity>
        </View>
    {this.state.visiable ? <OverlayComponent name={this.state.name} description={this.state.description} date={this.state.date}></OverlayComponent> : null}
    {this.state.visiableMoreinfo ? <OverlayMoreinfo name={this.state.name} description={this.state.description} date={this.state.date} author={this.state.author} Public={this.state.public} img={this.state.img} color={this.state.color} latitude={this.state.latitude} longitude={this.state.longitude}></OverlayMoreinfo> : null}
        </View>
    )
    }
}

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.log("An error has occured")
        return;
    }
    if (data) {
        const { locations } = data;
        AsyncStorage.setItem("longitude", locations[0].coords.longitude.toString())
        AsyncStorage.setItem("latitude", locations[0].coords.latitude.toString())
    }
});  

export default withMyHook(MapScreen)