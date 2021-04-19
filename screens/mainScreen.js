import React, { useEffect, useState } from 'react'
import { View, Text, Button, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native'
import config from '../config/settings.json'
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';
import SearchInput, { createFilter } from 'react-native-search-filter';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location'
import { getLocationPermission } from '../permissions'
import { loader } from './loader'
import { AuthContext } from '../components/context'

export const navigationRef = React.createRef();

export function navigate(name, params) {
    if(navigationRef.current?.getCurrentRoute().name === 'customMapScreen'){
        navigationRef.current?.goBack()
    }
    navigationRef.current?.navigate(name, params);
}

async function backgroundLocation(location){
    const token = await AsyncStorage.getItem('userToken')
    fetch(config.server+'api/users/activity', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({
            location
        })
    })
}

const registerTask = () => {
    TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
        if (error) {
            console.log("An error has occured")
            return;
        }
        if (data) {
            const { locations } = data;
            backgroundLocation(locations)
            AsyncStorage.setItem('locations', JSON.stringify(locations[0]))
        }
    }); 
}

const LOCATION_TASK_NAME = 'background-location-task';

const KEYS_TO_FILTERS = ['name', 'description'];

const mainScreen = ({ route, navigation }) => {
    const { signOut } = React.useContext(AuthContext)

    const [data, setData] = React.useState({
        maps: []
    })

    const [user, setUser] = React.useState(null)

    const [isLoading, setisLoading] = React.useState(true)

    const [userToken, setUserToken] = React.useState(null)

    const RETRIEVE_TOKEN = async () => {
        const pushtoken = await AsyncStorage.getItem('pushtoken')
        const token = await AsyncStorage.getItem('userToken')
        setUserToken(token)
        await fetch(config.server+'api/users/current', {
            headers: {
                'x-access-token': token
            }
        })
        .then(response => response.json())
        .then(async response => {
            if(response.error){
                signOut()
                return;
            }
            setUser(response)
            await AsyncStorage.setItem('user',JSON.stringify(response))
            if(pushtoken!==response.pushtoken&&pushtoken!=null){
                fetch(config.server+'api/users/pushToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    },
                    body: JSON.stringify({
                        pushtoken: pushtoken
                    })
                })
            }
        })
    }

    async function retrieve() {
        await RETRIEVE_TOKEN()
        await fetch(config.server+'api/public/map')
        .then(response => response.json())
        .then(response => {
            setData({
                maps: response
            })
            setFilter(response)
            setisLoading(false)
        })
        await getLocationPermission()
        Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000*30,
            distanceInterval: 10
        });
        let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true, timeout: 30000, maximumAge: 1000})
        registerTask()
        await AsyncStorage.setItem('locations', JSON.stringify(location))
    }

    useEffect(() => { 
        async function retrieveinside(){
            await retrieve()
            //console.log(data)
        }
        retrieveinside()
    }, [])

    const join = (id) => {
        const index = data.maps.findIndex(map => map._id.toString() === id.toString())
        data.maps[index].users.push(user.name)
        setData({...data})
        fetch(config.server+'api/public/join', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': userToken
            },
            body: JSON.stringify({
                id: id
            })
        })
    }

    const leave = (id) => {
        const index = data.maps.findIndex(map => map._id.toString() === id.toString())
        const userindex = data.maps[index].users.findIndex(users => users === user.name)
        data.maps[index].users.splice(userindex, 1)
        setData({...data})
        fetch(config.server+'api/public/leave', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': userToken
            },
            body: JSON.stringify({
                id: id
            })
        })
    }

    const element = (map) => {
        return (
            <View style={{flex: 1, flexDirection: 'row', margin: 20, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(100,100,200,0.6)'}} key={map._id.toString()}>
                <TouchableOpacity
                    style={{width: '80%', alignItems: "center", backgroundColor: "#DDD", paddingHorizontal: 10, borderEndWidth: 3, borderEndColor: 'rgba(100,100,200,0.6)' }}
                    onPress={() => navigation.navigate('customMapScreen', {
                        user: user, map: map._id.toString(), token: userToken
                    })}
                    key={map._id.toString()}
                >
                    <Text style={{fontSize: 20, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: 'rgba(100,100,200,0.6)'}}>{map.name}</Text>
                    <Text>{map.description}</Text>
                </TouchableOpacity>
                { !map.users.includes(user.name) ? (
                <TouchableOpacity style={{ width: '20%', backgroundColor: '#29C584', alignItems: 'center', justifyContent: 'center'}}
                onPress={() => {
                    let scopes = ''
                    map.scope.forEach(scope => {
                        scopes += scope + '\n'
                    })
                    Alert.alert(
                        'This map require next scopes: ',
                        scopes,
                        [
                            {
                            text: 'Cancel',
                            style: "cancel"
                            },
                            { text: "OK", onPress: () => join(map._id)}
                        ],
                        { cancelable: false }
                    )
                }}
                >
                    <Text style={{color: '#FFF'}}>Join</Text>
                </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={{ width: '20%', backgroundColor: '#792F3E', alignItems: 'center', justifyContent: 'center'}}
                onPress={() => {
                    let scopes = ''
                    map.scope.forEach(scope => {
                        scopes += scope + '\n'
                    })
                    Alert.alert(
                        'Are you sure?',
                        'Answer',
                        [
                            {
                            text: 'NO',
                            style: "cancel"
                            },
                            { text: "OK", onPress: (() => {leave(map._id)})}
                        ],
                        { cancelable: false }
                    )
                }}
                >
                    <Text style={{color: '#FFF'}}>Leave</Text>
                </TouchableOpacity>
                )}
            </View>
        )
    }

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true)
        await retrieve()
        setRefreshing(false)
    })

    const [filter, setFilter] = React.useState(data.maps)

    if(isLoading){
        return(
            loader()
        )
    }

    return (
        <ScrollView style={{flex: 1}}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
            <View style={{alignItems: 'center', marginTop: '10%', backgroundColor: '#DDD'}}>
                <TouchableOpacity onPress={() => signOut()}><Text>Sign Out</Text></TouchableOpacity>
            </View>
            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', margin: 30, marginTop: 20, marginBottom: 10, flexDirection: 'row', borderColor: 'rgba(100,100,200,0.6)', borderWidth: 3}}>
                <Icon name={'search'} size={30} color={'rgba(0,0,0,0.5)'}></Icon>
                <SearchInput 
                    onChangeText={(term) => { setFilter(data.maps.filter(createFilter(term, KEYS_TO_FILTERS))) }}
                    placeholder="Type a message to search"
                />
            </View>
            { filter.length==0 ? (
                <View style={{flex: 1, margin: 20, alignItems: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: "bold"}}>Nothing found</Text>
                </View>
            )
            :filter.map(map => {
                return (
                    element(map)
                )
            })}
        </ScrollView>
    ) 
} 

export default mainScreen