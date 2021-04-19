import React from 'react'
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TextInput
} from 'react-native'
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import config from '../config/settings'
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

export default class createPublicScreen extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            isLoading: false,
            id: null,
            name: null,
            description: null,
            img: [null],
            token: props.route.params.authToken,
            //navigate: props.navigation.navigate
        }
    }

    publicHandle(id,name,description,token){
        this.setState({isLoading: true})
        return fetch(config.server+'api/public/createPublic', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': token
            },
            body: JSON.stringify({
                id: id,
                name: name,
                description: description
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response.error){
                this.setState({isLoading: false})
                return(
                showMessage({
                    message: "Error",
                    description: JSON.stringify(response.error),
                    type: "error"
                })
                )
            }
            else{
                this.props.navigation.navigate('PublicInfo',{id: id,authToken: this.props.route.params.authToken})
                return(
                showMessage({
                    message: "Success",
                    description: "Public created",
                    type: "success"
                })
                )
            }
        })
    }

    render(){
        if(this.state.isLoading){
            return(
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Image
                    source={require('../assets/loading.gif')}
                    >
                    </Image>
                </View>
            )
        }
        return(
            <View style={{flex:1}}>
            <View style={styles.container}>
                <View style={styles.header}>
                </View>
                <ScrollView style={styles.footer}>
                    <Animatable.View 
                    animation="fadeInUpBig"
                    style={[styles.footer, {
                        backgroundColor: 'rgba(255, 255, 255, 1)'
                    }]}
                >
                    <Text style={[styles.text_footer, {
                        color: 'rgba(68, 68, 68, 1)'
                    }]}>ID</Text>
                    <View style={styles.action}>
                        <FontAwesome 
                            name="user-o"
                            color={'rgba(68, 68, 68, 1)'}
                            size={20}
                        />
                        <TextInput 
                            placeholder="ID"
                            placeholderTextColor="#666666"
                            style={[styles.textInput, {
                                color: 'rgba(68, 68, 68, 1)'
                            }]}
                            autoCapitalize="none"
                            onChangeText={(val) => this.setState({id: val})}
                        />
                    </View>
                    <Text style={[styles.text_footer, {
                        color: 'rgba(68, 68, 68, 1)',
                        marginTop: 35
                    }]}>Name</Text>
                    <View style={styles.action}>
                        <Feather 
                            name="x-circle"
                            color={'rgba(68, 68, 68, 1)'}
                            size={20}
                        />
                        <TextInput 
                            placeholder="Name"
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
                    }]}>Description</Text>
                    <View style={styles.action}>
                        <Feather 
                            name="x-circle"
                            color={'rgba(68, 68, 68, 1)'}
                            size={20}
                        />
                        <TextInput 
                            placeholder="Description"
                            placeholderTextColor="#666666"
                            style={[styles.textInput, {
                                color: 'rgba(68, 68, 68, 1)'
                            }]}
                            autoCapitalize="none"
                            onChangeText={(val) => this.setState({description: val})}
                        />
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity
                            style={styles.signIn}
                            onPress={() => this.publicHandle(this.state.id,this.state.name,this.state.description,this.state.token)}
                        >
                        <LinearGradient
                            colors={['#08d4c4', '#01ab9d']}
                            style={styles.signIn}
                        >
                            <Text style={[styles.textSign, {
                                color:'#fff'
                            }]}>Create Public</Text>
                        </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
                </ScrollView>
            </View>
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
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        //position: 'absolute', left: 0, right: 0, bottom: 0, height: "80%",
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