import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SearchInput, { createFilter } from 'react-native-search-filter';
import Icon from 'react-native-vector-icons/FontAwesome';
import config from '../config/settings.json';
import Feather from 'react-native-vector-icons/Feather'
import { loader } from './loader'

const myMapsScreen = ({ route, navigation }) => {

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
            <View style={{flex: 1, flexDirection: 'row', margin: 10, justifyContent: 'center', backgroundColor: '#E2E2E2', borderRadius: 30, padding: 10, alignItems: 'center'}} key={map._id.toString()}>
                <TouchableOpacity
                    style={{width: '80%', alignItems: "center", paddingHorizontal: 10 }}
                    onPress={() => navigation.navigate('customMapScreen', {
                        user: user, map: map._id.toString(), token: userToken
                    })}
                    key={map._id.toString()}
                >
                    <Text style={{color: "rgba(68, 68, 68, 1)", fontSize: 20, textAlign: 'center', justifyContent: 'center', alignContent: 'center', padding: 10}}>{map.name}</Text>
                    { map.description ? (
                       <Text style={{ color: "rgba(68, 68, 68, 1)" }}>{map.description}</Text>
                   ) : null}
                </TouchableOpacity>
                { !map.users.includes(user.name) ? (
                <TouchableOpacity style={{height: 55, width: 70, padding: 15, backgroundColor: '#4E904C', alignItems: 'center', justifyContent: 'center', borderRadius: 50}}
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
                    <TouchableOpacity style={{width: 70, height: 55, padding: 15, backgroundColor: '#904C5A', alignItems: 'center', justifyContent: 'center', borderRadius: 50}}
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

    const [userToken, setUserToken] = useState(null)

    const [data, setData] = useState({
        maps: null
    })
    
    const [user, setUser] = useState(null)

    const [isLoading, setisLoading] = useState(true)

    const [filter, setFilter] = useState(null)

    const RETRIEVE_TOKEN = async () => {
        const token = await AsyncStorage.getItem('userToken')
        setUserToken(token)
        const users = JSON.parse(await AsyncStorage.getItem('user'))
        setUser(users)
        await fetch(config.server+'api/public/mapsjoin',{
            headers: {
                'x-access-token': token
            }
        })
        .then(response => response.json())
        .then(response => {
            setData({
                maps: response
            })
            setFilter(response)
            setisLoading(false)
        })
    }

    useEffect(() => {
        async function retrieve() {
            await RETRIEVE_TOKEN()
        }
        retrieve()
    }, [])

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true)
        await RETRIEVE_TOKEN()
        setRefreshing(false)
    })

    if(isLoading){
        return(
            loader()
        )
    }

    if(data.maps.length === 0){
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text>You not entered in any map yet</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('mainScreen')}
                >
                    <Text style={{color: 'blue', fontStyle: 'italic'}}>Click here to enter</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <ScrollView style={{flex: 1}}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 10, flexDirection: 'row', borderColor: 'rgba(143, 143, 143, 0.75);', borderWidth: 0, borderRadius: 50, padding: 10, paddingLeft: 10, margin: 10, marginTop: 35}}>
            <Feather name={'search'} size={30} style={{ marginRight: 7 }} color={'rgba(143, 143, 143, 0.75);'}></Feather>
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

export default myMapsScreen