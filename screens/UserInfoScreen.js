import React, {useState} from 'react'
import * as Animatable from 'react-native-animatable';
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    StyleSheet,
    Button,
    ScrollView
} from 'react-native'
import { format, parseISO } from 'date-fns'

import config from '../config/settings'

export default class UserInfoScreen extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            isLoading: true,
            user: null
        }
    }

    async componentDidMount(){
        const res = await fetch(config.server+'api/users/info', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            },
            body: JSON.stringify({
                name: this.props.route.params.name
            })
        })
        .then(response => response.json())
        .then(response => {
            this.setState({
                isLoading: false,
                user: response
            })
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
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image style={{width:128,height:128}} source={require('../assets/profileicon.png')}></Image>
                </View>
                <ScrollView style={styles.footer}>
                    <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 12}}>Registered: {format(parseISO(this.state.user.dateCreated),'yyyy-MM-dd H:m')}</Text>
                    <Text style={styles.title}>{this.state.user.name}</Text>
                    {this.state.user.public.map((Public) => (
                        <Button style={{flex:1}} onPress={() => this.props.navigation.navigate('PublicInfo',{id:Public.ind,authToken:this.props.route.params.authToken})} title={Public.ind} key={Public.ind}>123</Button>
                    ))}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#4587C5',
      position: "relative"
    },
    header: {
        flex: 1,
        alignItems: 'center',
        position: 'absolute', left: 0, right: 0, top: 0
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
        marginTop: 100
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