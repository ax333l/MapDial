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
import { showMessage } from "react-native-flash-message";
import config from '../config/settings'
import update from 'react-addons-update'

import SearchInput, { createFilter } from 'react-native-search-filter';

const KEYS_TO_FILTERS = ['name'];

export default class PublicSubsListScreen extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            searchTerm: '',
            subs: [],
            current: null,
            isOwner: false
        }

        this.handleMakeAdmin = this.handleMakeAdmin.bind(this)
        this.handleRemoveAdmin = this.handleRemoveAdmin.bind(this)
    }

    async componentDidMount(){
        await fetch(config.server+'api/users/current', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            }
        })
        .then(response => response.json())
        .then(response => {
            console.log(response)
            this.setState({
                current: response
            })
        })
        await fetch(config.server+'api/public/PublicSubs', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            },
            body: JSON.stringify({
                publicid: this.props.route.params.publicid
            })
        })
        .then(response => response.json())
        .then(response => {
            this.setState({
                subs: response,
                isLoading: false
            })
        })
        const index = this.state.subs.findIndex((sub) => sub.name === this.state.current.name)
        if(index!=-1)
            if(this.state.subs[index].isOwner){
                this.setState({
                    isOwner: true
                })
            }
    }

    searchUpdated(term) {
        this.setState({ searchTerm: term })
    }

    handleMakeAdmin(id,i){
        return fetch(config.server+'api/public/addAdmin', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            },
            body: JSON.stringify({
                publicid: this.props.route.params.publicid,
                id: id
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response.error){
                return(
                    showMessage({
                        message: "Error",
                        description: JSON.stringify(response.error),
                        type: "Error"
                    })
                )
            }
            this.setState({
                subs: update(this.state.subs, {[i]: {isAdmin: {$set: true}}})
            })
            return(
                showMessage({
                    message: "Success",
                    description: response.success,
                    type: "success"
                })
            )
        })
    }

    handleRemoveAdmin(id,i){
        return fetch(config.server+'api/public/removeAdmin', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            },
            body: JSON.stringify({
                publicid: this.props.route.params.publicid,
                id: id
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response.error){
                return(
                    showMessage({
                        message: "Error",
                        description: response.error,
                        type: "Error"
                    })
                )
            }
            this.setState({
                subs: update(this.state.subs, {[i]: {isAdmin: {$set: false}}})
            })
            return(
                showMessage({
                    message: "Success",
                    description: response.success,
                    type: "success"
                })
            )
        })
    }

        render(){
            const filtered = this.state.subs.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
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
                    <SearchInput 
                    onChangeText={(term) => { this.searchUpdated(term) }} 
                    style={styles.searchInput}
                    placeholder="Type a message to search"
                    />
                    <ScrollView>
                    {filtered.map((User,i) => {
                        return (
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('UserInfo',{name: User.name,authToken:this.props.route.params.authToken})} key={User.name} style={styles.emailItem}>
                            <View>
                            {!User.isAdmin ? (
                                <Text>{User.name}</Text>
                            ) : (
                                <Text style={{color: 'red'}}>{User.name}</Text>
                            )}
                            {this.state.isOwner && !User.isAdmin && User.name!==this.state.current.name? (
                                <Button title="make admin" onPress={()=>this.handleMakeAdmin(User._id,i)}></Button>
                            ) : null}
                            {this.state.isOwner && User.isAdmin && User.name!==this.state.current.name ? (
                                <Button title="remove admin" style={{color: 'red'}} onPress={()=>this.handleRemoveAdmin(User._id,i)}></Button>
                            ) : null}
                            </View>
                        </TouchableOpacity>
                        )
                    })}
                    </ScrollView>
                </View>
            )
        }
    }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'flex-start'
    },
    emailItem:{
        borderBottomWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.3)',
        padding: 10
    },
    emailSubject: {
        color: 'rgba(0,0,0,0.5)'
    },
    searchInput:{
        padding: 10,
        borderColor: '#CCC',
        borderWidth: 1
    }
});
    