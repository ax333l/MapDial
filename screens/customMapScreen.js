import React, { useEffect, useContext, useRef } from 'react'
import MapView, { Marker, Callout, Polygon, Polyline, Circle, Overlay, Heatmap, Geojson, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, Button, TouchableOpacity, TextInput, ScrollView, StyleSheet, Image } from 'react-native'
import { showMessage } from "react-native-flash-message";
import config from '../config/settings.json'
import io from 'socket.io-client';
import { WebView } from 'react-native-webview';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-community/async-storage'
import Feather from 'react-native-vector-icons/Feather';
import { loader } from './loader'
import DropDownPicker from 'react-native-dropdown-picker';

const customMapScreen = ({ route, navigation }) => {

    const [uri, setUri] = React.useState(null)

    const components = (component) => {
        const variables = component.variables
        if((!component.variables.latitude||!component.variables.longitude)&&component.type==='marker'){
            return
        }
        switch(component.type){
            case 'marker':
                return (
                    <Marker
                        coordinate={{
                            longitude: variables.longitude,
                            latitude: variables.latitude
                        }}
                        resizeMode="contain"
                        key={component._id.toString()}
                        pinColor={variables.pinColor}
                        title={variables.title}
                        description={variables.description}
                        onPress={(e) => {
                            if(!variables.onPress) return
                            e.stopPropagation()
                            if(variables.onPress[variables.onPress.length-1]!='/') variables.onPress+='/'
                            let url = variables.onPress + (variables.send?'?':'')
                            for(const variable in variables.send){
                                url += `${variables.send[variable]}=${data.user[variables.send[variable]]}` + (variable<variables.send.length-1?'&':'')
                            }
                            setUri(url)
                        }}
                    >
                        <MapView.Callout style={{ flex: 1, position: 'relative' }}>
                            <View>
                                <View style={{borderBottomWidth: 1, borderBottomColor: 'black'}}>
                                    <Text style={{fontWeight: "bold"}}>{variables.title}</Text>
                                </View>
                                <Text>{variables.description}</Text>
                            </View>
                        </MapView.Callout>
                    </Marker>
                )
            case 'polyline':
                if(!variables.coordinates||!variables.coordinates.length) return
                return (
                    <Polyline
                        key={component._id.toString()}
                        coordinates={
                            variables.coordinates
                        }
                        strokeColor={variables.color}
                        tappable={true}
                        onPress={() => {
                            if(!variables.onPress) return
                            url = variables.onPress + (variables.send?'?':'')
                            for(const variable in variables.send){
                                url += `${variables.send[variable]}=${data.user[variables.send[variable]]}` + (variable<variables.send.length-1?'&':'')
                            }
                            setUri(url)
                        }}
                    />
                )
            case 'circle':
                if(!variables.center) return
                return (
                    <Circle
                        center={variables.center}
                        radius={variables.radius}
                        strokeColor={variables.strokeColor}
                        strokeWidth={variables.strokeWidth}
                        fillColor={variables.fillColor}
                        key={component._id.toString()}
                    >
                    </Circle>
                )
            case 'polygon':
                if(!variables.coordinates||!variables.coordinates.length) return
                return (
                    <Polygon
                        key={component._id.toString()}
                        coordinates={variables.coordinates}
                        strokeColor={variables.strokeColor}
                        fillColor={variables.fillColor}
                    >
                    </Polygon>
                )
            case 'heatmap':
                if(!variables.points||!variables.points.length) return
                return (
                    <Heatmap
                        key={component._id.toString()}
                        points={variables.points}
                        radius={variables.radius?variables.radius:undefined}
                        opacity={variables.opacity}
                    >
                    </Heatmap>
                )
        }
    }

    const mapRef = React.useRef(null)

    const animateToRegion = (region) => {
        mapRef.current.animateToRegion(region, 1000);
    }     

    const [data, setData] = React.useState({
        components: [],
        map: route.params.map,
        user: route.params.user,
    })

    const [join, setJoin] = React.useState(true)

    const [initialRegion, setInitialRegion] = React.useState(null)

    const [isOwner, setisOwner] = React.useState(false)

    const [isEdit, setisEdit] = React.useState(null)

    const overlaySize = () => {
        return (
            <TouchableOpacity
                    style={{height: 20, backgroundColor: "#DDD", alignItems: 'center'}}
                    onPress={() => size==='40%'?setSize('95%'):setSize('40%')}
                > 
                {size=='40%'? (
                    <Feather 
                        name="chevrons-up"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    />
                ) : (
                    <Feather
                        name="chevrons-down"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    >
                    </Feather>
                )}
            </TouchableOpacity>
        )
    }

    const [isLoading, setisLoading] = React.useState(true)

    const [size, setSize] = React.useState('40%')

    const [location, setLocation] = React.useState(null)

    const [create, setCreate] = React.useState(null)

    const [createData, setCreateData] = React.useState({
        type: 'marker'
    })

    const deletePolygon = (index) => {
        if(index!==-1){
            if(!createData.notification.completed){
                const array = createData.notification.polygon.filter((coord, i) => i !== index)
                setCreateData({
                    ...createData,
                    notification: {
                        ...createData.notification,
                        polygon: array
                    }
                })
            }
            else{
                const array = createData.variables.coordinates.filter((coord, i) => i !== index)
                setCreateData({
                    ...createData,
                    variables: {
                        ...createData.variables,
                        coordinates: array
                    }
                })
            }
        }
    }

    const handleCreate = async () => {
        setisLoading(true)
        await fetch(config.server+'api/public/createcomponent', {
            method: 'POST',
            headers: {
                'x-access-token': route.params.token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...createData, id: data.map})
        })
        .then(response => response.json())
        .then(response => {
            if(response.status){
                setCreate(false)
                setData({
                    ...data,
                    components: [
                        ...data.components,
                        createData
                    ]
                })
                showMessage({
                    message: JSON.stringify(response.response),
                    type: "success"
                })
            }
            else{
                showMessage({
                    message: JSON.stringify(response.response),
                    type: "warning"
                })
            }
            setisLoading(false)
        })
    }

    const locationUpdate = async () => {
        const locations = await AsyncStorage.getItem('locations')
        setLocation(JSON.parse(locations))
    }

    useEffect(() => {
        locationUpdate()
        setTimeout(async () => {
            await locationUpdate()
        }, 30*1000);
        data.socket = io(config.server)
        data.socket.emit('join', data.map)
        data.socket.emit('join', data.user._id.toString())
        data.socket.on('update', components => {
            components = components.filter(e => (!e.private||(e.private&&e.for.includes(data.user.name))))
            setData({
                ...data,
                components: components
            })
        })
        data.socket.on('mapref', region => {
            animateToRegion(region)
        })
        fetch(config.server+'api/public/map/'+data.map, {
            headers: {
                'x-access-token': route.params.token
            }
        })
        .then(response => response.json())
        .then(response => {
            setData({
                ...data,
                components: response.components,
                mapStyle: response.mapStyle,
                initialRegion: response.initialRegion
            })
            setJoin(response.join)
            setInitialRegion(response.initialRegion)
            setisOwner(response.isOwner)
            if(!response.isOwner&&response.isEdit){
                setisEdit(response.isEdit)
            }
            setisLoading(false)
        })
    }, [])
    
    if(isLoading){
        return(
            loader()
        )
    }

        return (
            <View style={{flex: 1}}>
                <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                style={{flex: 1}}
                customMapStyle={data.mapStyle}
                showsUserLocation={true}
                initialRegion={route.params.initialRegion?route.params.initialRegion:initialRegion?initialRegion:{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5
                }}
                onRegionChangeComplete={data => {
                    setInitialRegion(data)
                }}
                onUserLocationChange={data => {
                    //console.log(data)
                }}
                userLocationUpdateInterval={60000}
                onLongPress={dataa => {
                    if(!isOwner&&!isEdit) return
                    setCreate(true)
                    animateToRegion({
                        latitude: dataa.nativeEvent.coordinate.latitude,
                        longitude: dataa.nativeEvent.coordinate.longitude
                    })
                    setCreateData({
                        type: 'marker',
                        _id: 'create'+String(Math.random()*100000),
                        notification: {
                            type: 'all',
                            completed: true
                        },
                        variables: {
                            ...dataa.nativeEvent.coordinate,
                            coordinates: [],
                            points: [],
                            radius: 0
                        }
                    })
                }}
                onPress={(data) => {
                    if(create){
                        if(!createData.notification.completed){
                            if(createData.notification.type==='radius'){
                                setCreateData({
                                    ...createData,
                                    notification: {
                                        ...createData.notification,
                                        latitude: data.nativeEvent.coordinate.latitude,
                                        longitude: data.nativeEvent.coordinate.longitude
                                    }
                                })
                            }
                            else{
                                setCreateData({
                                    ...createData,
                                    notification: {
                                        ...createData.notification,
                                        polygon: [
                                            ...createData.notification.polygon,
                                            {latitude: data.nativeEvent.coordinate.latitude, longitude: data.nativeEvent.coordinate.longitude}
                                        ]
                                    }
                                })
                            }
                            return 
                        }
                        switch(createData.type){
                            case 'marker': {
                                setCreateData({
                                    ...createData,
                                    variables: {
                                        ...createData.variables,
                                        ...data.nativeEvent.coordinate
                                    }
                                })
                                return
                            }
                            case 'polygon': {
                                let temp = createData
                                setCreateData({
                                    ...temp,
                                    variables: {
                                        ...temp.variables,
                                        coordinates: [
                                            ...temp.variables.coordinates,
                                            {latitude: data.nativeEvent.coordinate.latitude, longitude: data.nativeEvent.coordinate.longitude}
                                        ]
                                    }
                                })
                                return
                            }
                            case 'polyline': {
                                let temp = createData
                                setCreateData({
                                    ...temp,
                                    variables: {
                                        ...temp.variables,
                                        coordinates: [
                                            ...temp.variables.coordinates,
                                            {latitude: data.nativeEvent.coordinate.latitude, longitude: data.nativeEvent.coordinate.longitude}
                                        ]
                                    }
                                })
                                return
                            }
                            case 'heatmap': {
                                setCreateData({
                                    ...createData,
                                    variables: {
                                        ...createData.variables,
                                        points: [
                                            ...createData.variables.points,
                                            {latitude: data.nativeEvent.coordinate.latitude, longitude: data.nativeEvent.coordinate.longitude}
                                        ]
                                    }
                                })
                                return
                            }
                            case 'circle': {
                                setCreateData({
                                    ...createData,
                                    variables: {
                                        ...createData.variables,
                                        center: data.nativeEvent.coordinate,
                                        radius: 0
                                    }
                                })
                                return
                            }
                        }
                    }
                    setUri(null)
                    setSize('40%')
                }}
                >
                    { create && createData.notification.type === 'radius' ? (
                        components({_id: 'notification', type: 'circle', variables: {...createData.notification, center: {latitude: createData.notification.latitude, longitude: createData.notification.longitude}}})
                    ) : null}
                    { create && createData.notification.type === 'polygon' ? (
                        components({_id: 'notification', type: 'polygon', variables: {coordinates: createData.notification.polygon}}) 
                    ) : null}
                    { create && createData.type === 'polygon' && createData.notification.completed ? (
                        createData.variables.coordinates.map((marker, i) => {
                            return(
                                <Marker coordinate={{
                                    latitude: marker.latitude,
                                    longitude: marker.longitude       
                                }}
                                key={i}
                                onPress={() => deletePolygon(i)}
                                >
                                <Feather name={"x-octagon"} size={18} color="#900"></Feather>
                                </Marker>
                            )
                        })
                    ) : null}
                    { create && createData.notification.type === 'polygon' && !createData.notification.completed ? (
                        createData.notification.polygon.map((marker, i) => {
                            return(
                                <Marker coordinate={{
                                    latitude: marker.latitude,
                                    longitude: marker.longitude       
                                }}
                                key={i}
                                onPress={() => deletePolygon(i)}
                                >
                                <Feather name={"x-octagon"} size={18} color="#900"></Feather>
                                </Marker>
                            )
                        })
                    ) : null}
                    { create ? (
                        components(createData)
                    ) : null}
                    { data.components.map(component => {
                        return (
                            components(component)
                        )
                    }) }
                </MapView>
                { create && !createData.notification.completed ? (
                    <View style={{flex: 1, position: 'absolute', left: 0, right: 0, top: '5%', alignItems: 'center', flexDirection: 'row', margin: 5}}>
                        <TouchableOpacity onPress={() => {setCreateData({
                            ...createData,
                            notification: {
                                ...createData.notification,
                                completed: true
                            }
                        })}}
                        style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                        { createData.notification.type === 'radius' ? (
                            <Text style={{flex: 1, fontSize: 20, color: '#666666', alignItems: 'center'}}>Select coordinate and complete radius box</Text>
                        ) : (
                            <Text style={{fontSize: 20, color: '#666666', alignItems: 'center'}}>Select polygon</Text>
                        )}
                            <Feather size={25} name={'check'} backgroundColor={'black'}></Feather>
                        </TouchableOpacity>
                    </View>
                ) : null}
                { !join ? (
                   <View style={{position: 'absolute', height: "100%", width: "100%", alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(100,100,200,0.6)'}}>
                       <Text>You should join first to interact with map</Text>
                   </View>
                ) : null }
                { create ? (
                    <Animatable.View animation="fadeInUpBig" style={{flex: 1, position: 'absolute', bottom: 0, width: "100%", height: size}}>
                        <TouchableOpacity
                            style={{height: 20, backgroundColor: "#DDD", alignItems: 'center', borderTopStartRadius: 30, borderTopEndRadius: 30}} onPress={() => setCreate(false)}
                        >
                            <Feather size={20} name={'x-square'}>
                            </Feather>
                        </TouchableOpacity>
                        {overlaySize()}
                        <ScrollView style={{flex: 1, backgroundColor: "rgba(155,155,155,0.9)"}}>
                        <DropDownPicker
                            items={[
                                {label: 'MARKER', value: 'marker', icon: () => <Feather name="map-pin" size={18} color="#900" />},
                                {label: 'LINE', value: 'polyline', icon: () => <Feather name="minus" size={18} color="#900" />},
                                {label: 'POLYGON', value: 'polygon', icon: () => <Feather name="square" size={18} color="#900" />},
                                {label: 'CIRCLE', value: 'circle', icon: () => <Feather name="circle" size={18} color="#900" />},
                                {label: 'HEATPOINT', value: 'heatmap', icon: () => <Feather name="alert-circle" size={18} color="#900" />},
                            ]}
                            defaultValue={createData.type}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa', position: 'absolute', margin: "5%", marginHorizontal: "20%"}}
                            itemStyle={{
                                justifyContent: 'flex-start'
                            }}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => {
                                setCreateData({
                                    ...createData,
                                    type: item.value
                                })
                            }}
                        />
                        {!isOwner?(
                            <Text style={{color: 'purple'}}>Guest mode</Text>
                        ):null}
                        <View style={styles.action}>
                            <TextInput
                                placeholder="Title"
                                placeholderTextColor="#666666"
                                style={[styles.textInput, {
                                    color: 'black'
                                }]}
                                autoCapitalize="none"
                                onChangeText={text => setCreateData({...createData, variables: {...createData.variables, title: text}})}
                            />
                        </View>
                        <View style={styles.action}>
                            <TextInput
                                placeholder="Description"
                                placeholderTextColor="#666666"
                                style={[styles.textInput, {
                                    color: 'black'
                                }]}
                                autoCapitalize="none"
                                onChangeText={text => setCreateData({...createData, variables: {...createData.variables, description: text}})}
                            />
                        </View>
                        <View style={styles.action}>
                            <TextInput
                                placeholder="Link"
                                placeholderTextColor="#666666"
                                style={[styles.textInput, {
                                    color: 'black'
                                }]}
                                autoCapitalize="none"
                                onChangeText={text => {
                                    if(!text.startsWith('http')){
                                        text = 'http://' + text
                                    }
                                    setCreateData({...createData, variables: {...createData.variables, onPress: text}})
                                }}
                            />
                        </View>
                        { createData.type=='circle'||createData.type=='heatmap'?(
                            <View style={styles.action}>
                                <TextInput
                                    placeholder="Radius"
                                    placeholderTextColor="#666666"
                                    style={[styles.textInput, {
                                        color: 'black'
                                    }]}
                                    keyboardType={'number-pad'}
                                    autoCapitalize="none"
                                    onChangeText={text => setCreateData({...createData, variables: {...createData.variables, radius: parseInt(text) || 0}})}
                                />
                            </View>
                        ):null}
                        <View style={{flex: 1, alignItems: "center", marginTop: "5%"}}>
                            <Text style={{color: '#666666', fontSize: 18}}>NOTIFICATION</Text>
                        </View>
                        <DropDownPicker
                            items={[
                                {label: 'ALL', value: 'all', icon: () => <Feather name="users" size={18} color="#900" />},
                                {label: 'RADIUS', value: 'radius', icon: () => <Feather name="circle" size={18} color="#900" />},
                                {label: 'POLYGON', value: 'polygon', icon: () => <Feather name="square" size={18} color="#900" />},
                                {label: 'NONE', value: 'none', icon: () => <Feather name="user-x" size={18} color="#900" />},
                            ]}
                            defaultValue={createData.notification.type}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa', position: 'absolute', margin: "5%", marginHorizontal: "20%"}}
                            itemStyle={{
                                justifyContent: 'flex-start'
                            }}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => {
                                if(item.value === 'radius'){
                                    setCreateData({
                                        ...createData,
                                        notification: {
                                            ...createData.notification,
                                            type: item.value,
                                            completed: false,
                                            radius: 0,
                                            latitude: 0,
                                            longitude: 0
                                        }
                                    })
                                }
                                else if(item.value === 'polygon'){
                                    setCreateData({
                                        ...createData,
                                        notification: {
                                            ...createData.notification,
                                            type: item.value,
                                            completed: false,
                                            polygon: []
                                        }
                                    })
                                }
                                else{
                                    setCreateData({
                                        ...createData,
                                        notification: {
                                            ...createData.notification,
                                            type: item.value
                                        }
                                    })
                                }
                            }}
                        />
                        { !createData.notification.completed&&createData.notification.type === 'radius' ? (
                            <View style={styles.action}>
                                <TextInput
                                    placeholder="Radius"
                                    placeholderTextColor="#666666"
                                    style={[styles.textInput, {
                                        color: 'black'
                                    }]}
                                    keyboardType={'number-pad'}
                                    autoCapitalize="none"
                                    onChangeText={text => setCreateData({...createData, notification: {...createData.notification, radius: parseInt(text) || 0}})}
                                />
                            </View>
                        ) : null}
                        <TouchableOpacity style={{margin: "20%", alignItems: "center", backgroundColor: 'white', borderRadius: 20, height: "10%", justifyContent: 'center', marginHorizontal: '30%'}} onPress={() => handleCreate()}>
                            <Text style={{fontSize: 20, fontWeight: 'bold', color: "#666"}}>Create</Text>
                        </TouchableOpacity>
                        </ScrollView>
                    </Animatable.View>
                ) : null}
                { uri && !create ? (
                    <Animatable.View animation="fadeInUpBig" style={{flex: 1, position: 'absolute', bottom: 0, width: "100%", height: size}}>
                        {overlaySize()}
                        <WebView scalesPageToFit={false} source={{ uri: uri }} />
                    </Animatable.View>
                ) : null}
            </View>
        )
}

export default customMapScreen

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#009387'
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
        marginHorizontal: "10%"
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: "10%",
        paddingLeft: 10,
        color: '#05375a',
        fontSize: 16
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        marginTop: 50
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    }
  });