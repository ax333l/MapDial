import React from 'react'
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    ImageBackground,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions
} from 'react-native'
import MapView, { Marker, Circle, Polygon } from 'react-native-maps'
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { showMessage } from "react-native-flash-message";
import * as ImagePicker from 'expo-image-picker';
import mime from "mime"
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Permissions from 'expo-permissions';
//import { ImageBrowser } from 'expo-multiple-media-imagepicker'

import { setI18nConfig, translate } from '../components/localize';

import config from '../config/settings'

export default class createMarkerScreen extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            isLoading: true,
            publics: null,
            isChoose: true,
            isPolygon: false,
            isEdit: false,
            polygon: [],
            publicid: null,
            region: this.props.route.params.region,
            token: this.props.route.params.authToken,
            name: null,
            description: null,
            photo: [],
            img: [],
            color: null,
            notificationrange: null
        }

        this.handleOnPress = this.handleOnPress.bind(this)
        this.deletePolygon = this.deletePolygon.bind(this)
        this.deleteImage = this.deleteImage.bind(this)
        this.markerHandle = this.markerHandle.bind(this)
        this.upload = this.upload.bind(this)
        this.handleTakePicture = this.handleTakePicture.bind(this)
        this.handleMarkerEdit = this.handleMarkerEdit.bind(this)
    }

    async componentDidMount(){
        this.getPermissionAsync();
        this._getPermissionAsync()
        const res = await fetch(config.server+'api/public/getAllPublicsCanCreate', {
            method: 'GET',
            headers: {
                'x-access-token': this.props.route.params.authToken
            }
        })
        .then(response => response.json())
        this.setState({
            isLoading: false,
            isEdit: this.props.route.params.isEdit,
            publics: res
        })
        console.log(this.state.isEdit)
        if(this.props.route.params.isEdit){
            this.setState({
                isEdit: this.props.route.params.isEdit,
                isChoose: false,
                region: this.props.route.params.region,
                color: this.props.route.params.marker.color,
                photo: this.props.route.params.photo,
                name: this.props.route.params.marker.name,
                description: this.props.route.params.marker.description
            })
        }
    }

    onSelect = color => this.setState({ color: color });

    async upload(photo,token){
        const newImageUri =  "file:///" + photo.uri.split("file:/").join("");
    
        const formData = new FormData();
        formData.append('image', {
            uri : newImageUri,
            type: mime.getType(newImageUri),
            name: newImageUri.split("/").pop()
        });
        await fetch(config.server+'api/public/upload', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                'x-access-token': token
            },
            body: formData
        })
        .then(response1 => response1.json())
        .then(response1 => {
            if(response1.error){
                this.setState({isLoading: false})
                return(
                showMessage({
                    message: translate('error'),
                    description: JSON.stringify(response1.error),
                    type: "error"
                })
                )
            }
            else{
                this.state.img.push({link: response1.filename})
            }
        })
    }

    async markerHandle(publicid,name,description,latitude,longitude,token,color,notificationrange){
        this.setState({isLoading: true})
        if(this.state.photo.length>0){
            for(const photo of this.state.photo){
                await this.upload(photo,token)
            }
            fetch(config.server+'api/public/addMarker', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({
                    publicid: publicid,
                    name: name,
                    description: description,
                    latitude: latitude,
                    longitude: longitude,
                    pinColor: color,
                    img: this.state.img,
                    notificationrange: this.state.polygon.length>0 ? this.state.polygon : notificationrange 
                })
            })
            .then(response => response.json())
            .then(response => {
                if(response.error){
                    this.setState({isLoading: false})
                    return(
                    showMessage({
                        message: translate('error'),
                        description: JSON.stringify(response.error),
                        type: "error"
                    })
                    )
                }
                else{
                    this.props.navigation.navigate('Map')
                    return(
                    showMessage({
                        message: translate('success'),
                        description: "Marker created",
                        type: "success"
                    })
                    )
                }
            })
    }
    else{
        return fetch(config.server+'api/public/addMarker', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': token
            },
            body: JSON.stringify({
                publicid: publicid,
                name: name,
                description: description,
                latitude: latitude,
                longitude: longitude,
                pinColor: color,
                notificationrange: this.state.polygon.length>0 ? this.state.polygon : notificationrange
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response.error){
                this.setState({isLoading: false})
                return(
                showMessage({
                    message: translate('error'),
                    description: JSON.stringify(response.error),
                    type: "error"
                })
                )
            }
            else{
                this.props.navigation.navigate('Map')
                return(
                showMessage({
                    message: translate("success"),
                    description: "Marker created",
                    type: "success"
                })
                )
            }
        })
    }
    }

    getPermissionAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        }
    };

    _getPermissionAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        }
    };

    handleMarkerEdit = async () => {
        this.setState({isLoading: true})
        if(this.state.photo.length>0){
            for(const photo of this.state.photo){
                if(photo.uri){
                    await this.upload(photo,this.state.token)
                }
                else{
                    this.state.img.push({link: photo.link})
                }
            }
        }
        fetch(config.server+'api/public/editMarker', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.state.token
            },
            body: JSON.stringify({
                publicid: this.props.route.params.marker.publicin,
                markerid: this.props.route.params.markerid,
                name: this.state.name,
                description: this.state.description,
                latitude: this.state.region.latitude,
                longitude: this.state.region.longitude,
                pinColor: this.state.color,
                img: this.state.img
            })
        })
        .then(response => response.json())
        .then(response => {
            console.log(response)
            if(response.error){
                this.setState({isLoading: false})
                showMessage({
                    message: translate('error'),
                    description: response.error,
                    type: "error"
                })
            }
            else{
                this.setState({isLoading: false})
                showMessage({
                    message: translate('success'),
                    description: response.success,
                    type: "success"
                })
                this.props.navigation.navigate('Map')
            }
        })
    }

    handleChoosePhoto = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.2,
            });
            if (!result.cancelled) {
                this.setState({ photo: [...this.state.photo, result] })
            }
            } catch (E) {
                console.log(E);
        }
    };

    onChange = (color) => {
        this.setState({color: color})
    }

    handleTakePicture = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.2,
            });
            if (!result.cancelled) {
                this.setState({ photo: [...this.state.photo, result] })
            }
            } catch (E) {
                console.log(E);
        }
    };

    handleOnPress(e) {
        console.log(e.nativeEvent.coordinate)
        this.setState({
            polygon: [
                ...this.state.polygon,
                {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude
                }
            ]
        })
    }

    deletePolygon(i) {
        if(i!==-1){
            let polygon = [...this.state.polygon] 
            polygon.splice(i,1)
            this.setState({
                polygon: polygon
            })
        }
    }

    deleteImage(i) {
        if(i!==-1){
            let photo = [...this.state.photo] 
            photo.splice(i,1)
            this.setState({
                photo: photo
            })
        }
    }

    render(){

        const { publics } = this.state
        if(this.state.isLoading){
            return(
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Image
                    source={require('../assets/loading.gif')}
                    >
                    </Image>
                </View>
            );
        }
        if(this.state.isEdit){
            return(
                <View style={styles.container}>
                    <View style={styles.header}>
                        <MapView
                            style={{flex: 1}}
                            customMapStyle={config.theme[0][this.props.route.params.mapStyle]}
                            showsUserLocation={true}
                            initialRegion={
                                this.state.region
                            }
                            onPress={(e) => this.setState({region:{
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                                latitudeDelta: 1,
                                longitudeDelta: 1
                            }})}
                        >
                        <Marker coordinate={{
                            latitude: this.state.region.latitude,
                            longitude: this.state.region.longitude
                        }}
                        pinColor={this.state.color}
                        >
                        </Marker>
                        </MapView>
                    </View>
                    <ScrollView style={styles.footer}>
                <Animatable.View 
                animation="fadeInUpBig"
                style={[styles.footer, {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                }]}
            >
                <Text style={[styles.text_footer, {
                    color: 'rgba(68, 68, 68, 1)',
                    marginTop: 35
                }]}>{translate('name')}</Text>
                <View style={styles.action}>
                    <Feather 
                        name="x-circle"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    />
                    <TextInput 
                        placeholder={translate('name')}
                        value={this.state.name}
                        placeholderTextColor="#666666"
                        style={[styles.textInput, {
                            color: 'rgba(68, 68, 68, 1)'
                        }]}
                        autoCapitalize="none"
                        onChangeText={(val) => this.setState({name: val})}
                    />
                </View>
                <Text style={[styles.text_footer, {
                    color: 'rgba(68, 68, 68, 1)',
                    marginTop: 35
                }]}>{translate('description')}</Text>
                <View style={styles.action}>
                    <Feather 
                        name="x-circle"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    />
                    <TextInput 
                        placeholder={translate('description')}
                        value={this.state.description}
                        placeholderTextColor="#666666"
                        style={[styles.textInput, {
                            color: 'rgba(68, 68, 68, 1)'
                        }]}
                        autoCapitalize="none"
                        onChangeText={(val) => this.setState({description: val})}
                    />
                </View>
                { this.state.photo.map((photo,i) => {
                 return(
                    <View style={{flex:1,alignItems: "center", justifyContent: "center", padding: 5}} key={i}>
                        <ImageBackground source={{ uri: photo.link ? config.server + 'image/' + photo.link : photo.uri }} style={{ width: 200, height: 200 }}>
                        <TouchableOpacity
                        style={{
                            borderWidth:1,
                            borderColor:'rgba(0,0,0,0.2)',
                            alignItems:'center',
                            justifyContent:'center',
                            width:20,
                            height:20,
                            backgroundColor:'#fff',
                            borderRadius:50,
                            position: "absolute",
                            right: 5,
                            top: 5
                            }}
                        onPress={() => this.deleteImage(i)}
                        >
                            <Icon name={"times"} size={10} />
                        </TouchableOpacity>
                        </ImageBackground>
                    </View>
                )})}
                <Button title={translate('pickroll')} onPress={this.handleChoosePhoto} />
                <Button title={translate('takecamera')} onPress={this.handleTakePicture} />
                <View style={styles.button}>
                    <TouchableOpacity
                        style={styles.signIn}
                        onPress={() => this.handleMarkerEdit()}
                    >
                    <LinearGradient
                        colors={['#08d4c4', '#01ab9d']}
                        style={styles.signIn}
                    >
                        <Text style={[styles.textSign, {
                            color:'#fff'
                        }]}>{translate('editmarker')}</Text>
                    </LinearGradient>
                    </TouchableOpacity>
                </View>
                </Animatable.View>
                </ScrollView>
                </View>
            )
        }
        if(this.state.isChoose){
            if(publics.length>0)
                return(
                    <View style={{flex:1, alignItems: "center", justifyContent: "center"}}>
                        {publics.map((Public,i) => {
                            return(
                                <View style={{padding: 5, width: "60%"}} key={i}>
                                    <Button key={Public._id} title={Public.id} onPress={() => {this.setState({isChoose: false,publicid:Public._id})}}>{Public.id}</Button>
                                </View>
                            )
                        })}
                    </View>
                )
            else{
                return(
                <View style={{flex:1, alignItems: "center", justifyContent: "center"}}>
                    <Text>{translate('nopublics')}</Text>
                </View>
                )
            }
        }
        if(this.state.isPolygon){
            return(
                <View style={{flex: 1}}>
                    <MapView
                    style={{flex: 1}}
                    showsUserLocation={true}
                    customMapStyle={config.theme[0][this.props.route.params.mapStyle]}
                    initialRegion={
                        this.state.region
                    }
                    onPress={this.handleOnPress}
                    >
                    { this.state.polygon.length>0 ? (
                    <Polygon
                    coordinates={this.state.polygon}
                    fillColor={'rgba(100,100,200,0.3)'}
                    >
                    </Polygon>
                    ) : null}
                    <Marker
                    coordinate={{
                        latitude: this.state.region.latitude,
                        longitude: this.state.region.longitude
                    }}
                    >
                    </Marker>
                    {this.state.polygon.map((marker,i) => {
                        return(
                        <Marker coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude       
                        }}
                        key={i}
                        onPress={() => this.deletePolygon(i)}
                        >
                        <Icon name={"times"}></Icon>
                        </Marker>
                        )
                    })}
                    </MapView>
                    <View style={{opacity: 1,position: "absolute",right:10,top:10}}>
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
                        onPress={() => this.setState({isPolygon: false})}
                    >
                        <Icon name={"arrow-right"}  size={30} color="#01a699" />
                    </TouchableOpacity>
                    </View>
                </View>
            )
        }
        return(
            <View style={styles.container}>
                <View style={styles.header}>
                    <MapView
                        style={{flex: 1}}
                        customMapStyle={config.theme[0][this.props.route.params.mapStyle]}
                        showsUserLocation={true}
                        initialRegion={
                            this.state.region
                        }
                        onPress={(e) => this.setState({region:{
                            latitude: e.nativeEvent.coordinate.latitude,
                            longitude: e.nativeEvent.coordinate.longitude,
                            latitudeDelta: 1,
                            longitudeDelta: 1
                        }})}
                    >
                    { this.state.polygon.length>0 ? (
                    <Polygon
                    coordinates={this.state.polygon}
                    fillColor={'rgba(100,100,200,0.3)'}
                    >
                    </Polygon>
                    ) : null}
                        <Marker coordinate={{
                            latitude: this.state.region.latitude,
                            longitude: this.state.region.longitude
                        }}
                        pinColor={this.state.color}
                        >
                        </Marker>
                        { this.state.notificationrange ? (
                            <Circle
                            center={{
                                latitude: this.state.region.latitude,
                                longitude: this.state.region.longitude
                            }}
                            radius={Number(this.state.notificationrange)}
                            fillColor={'rgba(100,100,200,0.3)'}
                            ></Circle>
                        ) : null}
                    </MapView>
                </View>
                <ScrollView style={styles.footer}>
                <Animatable.View 
                animation="fadeInUpBig"
                style={[styles.footer, {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                }]}
            >
                <Text style={[styles.text_footer, {
                    color: 'rgba(68, 68, 68, 1)',
                    marginTop: 35
                }]}>{translate('name')}</Text>
                <View style={styles.action}>
                    <Feather 
                        name="x-circle"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    />
                    <TextInput 
                        placeholder={translate('name')}
                        value={this.state.name}
                        placeholderTextColor="#666666"
                        style={[styles.textInput, {
                            color: 'rgba(68, 68, 68, 1)'
                        }]}
                        autoCapitalize="none"
                        onChangeText={(val) => this.setState({name: val})}
                    />
                </View>
                <Text style={[styles.text_footer, {
                    color: 'rgba(68, 68, 68, 1)',
                    marginTop: 35
                }]}>{translate('description')}</Text>
                <View style={styles.action}>
                    <Feather 
                        name="x-circle"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    />
                    <TextInput 
                        placeholder={translate('description')}
                        value={this.state.description}
                        placeholderTextColor="#666666"
                        style={[styles.textInput, {
                            color: 'rgba(68, 68, 68, 1)'
                        }]}
                        autoCapitalize="none"
                        onChangeText={(val) => this.setState({description: val})}
                    />
                </View>
                { this.state.polygon.length===0 ? (
                    <View style={{flex: 1}}>
                        <Button title={translate('polygonnot')} onPress={() => this.setState({isPolygon: true, notificationrange: null})}></Button>
                        <Text style={[styles.text_footer, {
                            color: 'rgba(68, 68, 68, 1)',
                            marginTop: 35
                        }]}>{translate('notrange')}</Text>
                        <View style={styles.action}>
                            <Feather 
                                name="x-circle"
                                color={'rgba(68, 68, 68, 1)'}
                                size={20}
                            />
                            <TextInput 
                                placeholder={translate('notrange')}
                                placeholderTextColor="#666666"
                                style={[styles.textInput, {
                                    color: 'rgba(68, 68, 68, 1)'
                                }]}
                                autoCapitalize="none"
                                keyboardType="number-pad"
                                onChangeText={(val) => {
                                    this.setState({notificationrange: val.replace(/[^0-9]/g, ''),
                                })}
                                }
                            />
                        </View>
                    </View>
                ) : (
                    <View style={{flex: 1}}>
                        <Button title={translate('radiusnot')} onPress={() => this.setState({notificationrange: null, polygon: []})}></Button>
                    </View>
                )}
                { this.state.photo.map((photo,i) => { return(
                    <View style={{flex:1,alignItems: "center", justifyContent: "center", padding: 5}} key={i}>
                        <ImageBackground source={{ uri: photo.uri }} style={{ width: 200, height: 200 }}>
                        <TouchableOpacity
                        style={{
                            borderWidth:1,
                            borderColor:'rgba(0,0,0,0.2)',
                            alignItems:'center',
                            justifyContent:'center',
                            width:20,
                            height:20,
                            backgroundColor:'#fff',
                            borderRadius:50,
                            position: "absolute",
                            right: 5,
                            top: 5
                            }}
                        onPress={() => this.deleteImage(i)}
                        >
                            <Icon name={"times"} size={10} />
                        </TouchableOpacity>
                        </ImageBackground>
                    </View>
                )})}
                <Button title={translate('pickroll')} onPress={this.handleChoosePhoto} />
                <Button title={translate('takecamera')} onPress={this.handleTakePicture} />
                <View style={styles.button}>
                    <TouchableOpacity
                        style={styles.signIn}
                        onPress={() => this.markerHandle(this.state.publicid,this.state.name,this.state.description,this.state.region.latitude,this.state.region.longitude,this.state.token,this.state.color,this.state.notificationrange)}
                    >
                    <LinearGradient
                        colors={['#08d4c4', '#01ab9d']}
                        style={styles.signIn}
                    >
                        <Text style={[styles.textSign, {
                            color:'#fff'
                        }]}>{translate('createmarker')}</Text>
                    </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animatable.View>
            </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#009387'
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    footer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        //position: 'absolute', left: 0, right: 0, bottom: 0, height: "80%",
        paddingHorizontal: 20,
        paddingVertical: 30,
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
        paddingBottom: 5
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
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
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