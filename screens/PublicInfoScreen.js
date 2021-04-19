import React, {useState} from 'react'
import * as Animatable from 'react-native-animatable';
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    StyleSheet,
    Clipboard,
    TouchableOpacity
} from 'react-native'
import { format, parseISO } from 'date-fns'

import config from '../config/settings'
import { Button } from 'react-native-paper';
import { showMessage } from "react-native-flash-message";

export default class UserInfoScreen extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            isLoading: true,
            public: null,
            isOwner: false
        }
    }
    async componentDidMount(){
        await fetch(config.server+'api/public/isAdmin', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            },
            body: JSON.stringify({
                id: this.props.route.params.id
            })
        })
        .then(response => response.json())
        .then(response => {
            this.setState({isOwner: response.isOwner})
        })
        const res = await fetch(config.server+'api/public/getPublic', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            },
            body: JSON.stringify({
                id: this.props.route.params.id
            })
        })
        .then(response => response.json())
        .then(response => {
            this.setState({
                isLoading: false,
                public: response
            })
        })    
    }
    
    handleSub = (publicid,authToken,subscribe) => {
        this.setState({isLoading: true})
        if(subscribe){
            return fetch(config.server+'api/public/unsubscribe', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-access-token': authToken
                },
                body: JSON.stringify({
                    publicid: publicid
                })
            })
            .then(response => response.json())
            .then(response => {
                this.setState({isLoading: false})
                if(response.error){
                    return(
                    showMessage({
                        message: "Error",
                        description: JSON.stringify(response.error),
                        type: "error"
                    })
                    )
                }
                else{
                    this.setState( prevState => ({
                        public: {
                            ...prevState.public,
                            subscribe: false
                        }
                    }))
                    return(
                    showMessage({
                        message: "Success",
                        description: response.success,
                        type: "success"
                    })
                    )
                }
            })
        }
        else{
            return fetch(config.server+'api/public/subscribe', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-access-token': authToken
                },
                body: JSON.stringify({
                    publicid: publicid
                })
            })
            .then(response => response.json())
            .then(response => {
                this.setState({isLoading: false})
                if(response.error){
                    return(
                    showMessage({
                        message: "Error",
                        description: JSON.stringify(response.error),
                        type: "error"
                    })
                    )
                }
                else{
                    this.setState( prevState => ({
                        public: {
                            ...prevState.public,
                            subscribe: true
                        }
                    }))
                    return(
                    showMessage({
                        message: "Success",
                        description: response.success,
                        type: "success"
                    })
                    )
                }
            })
        }
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
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image style={{width:128,height:128}} source={require('../assets/communityicon.png')}></Image>
                </View>
                <View style={styles.footer}>
                <Button style={{alignItems: "center",margin: 5}} onPress={() => this.props.navigation.navigate('PublicSubs', {publicid: this.state.public.id,id:this.state.public._id,authToken:this.props.route.params.authToken})}>Public subs</Button>
                    { this.state.public.subscribe ? (
                        <Button style={{alignItems: "center"}} onPress={() => this.handleSub(this.state.public._id,this.props.route.params.authToken,this.state.public.subscribe)}>Unsubscribe</Button>
                    ) : (
                        <Button style={{alignItems: "center"}} onPress={() => this.handleSub(this.state.public._id,this.props.route.params.authToken,this.state.public.subscribe)}>Subscribe</Button>
                    )}
                    <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 12}}>Created: {format(parseISO(this.state.public.dateCreated),'yyyy-MM-dd H:m')}</Text>
                    <Text style={styles.title}>{this.state.public.name}</Text>
                    <Text style={styles.text,{textAlign:"center",flex:1}}>{this.state.public.id}</Text>
                    { this.state.public.description ? (<Text style={styles.text,{textAlign: "center",flex: 1}}>{this.state.public.description}</Text>): null}
                    { this.state.isOwner ? (
                    <TouchableOpacity style={{alignItems: "center"}} onPress={() => {
                        Clipboard.setString(this.state.public.api_key)
                        showMessage({
                            message: "Copied",
                            type: "info"
                        })
                        }}>
                        <Text>Click here to copy api key</Text>
                    </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#4587C5'
    },
    header: {
        flex: 1,
        alignItems: 'center'
    },
    footer: {
        flex: 2,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        position: 'absolute', left: 0, right: 0, bottom: 0, height: "80%",
        paddingVertical: 30,
        paddingHorizontal: 30
    },
    title: {
        color: '#05375a',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: "center"
    },
    text: {
        color: 'grey',
        marginTop:5
    },
    button: {
        alignItems: 'flex-end',
        marginTop: 30
    },
    signIn: {
        width: 150,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        flexDirection: 'row'
    },
    textSign: {
        color: 'white',
        fontWeight: 'bold'
    }
  });