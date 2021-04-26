import React, { useEffect, useState } from 'react'
import { View, Text, Button, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native'
import config from '../config/settings.json'
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather'
import AsyncStorage from '@react-native-community/async-storage';
import { loader } from './loader'
import SearchInput, { createFilter } from 'react-native-search-filter';

const myMapsScreen = ({ route, navigation }) => {
    const element = (map) => {
        return (
            <View style={{flex: 1, flexDirection: 'row', margin: 10, justifyContent: 'center', justifyContent: 'center', backgroundColor: '#E2E2E2', borderRadius: 30, padding: 10}} key={map._id.toString()}>
                <TouchableOpacity
                    style={{width: '70%', alignItems: "center", paddingHorizontal: 10, alignItems: 'center', borderBottomStartRadius: 30, borderTopStartRadius: 30 }}
                    onPress={() => navigation.navigate('customMapScreen', {
                        user: user, map: map._id.toString(), token: userToken
                    })}
                    key={map._id.toString()}
                >
                    <Text style={{flex: 1, flexDirection:'row', color: "rgba(68, 68, 68, 1)", fontSize: 20, textAlign: 'center', justifyContent: 'center', alignContent: 'center', padding: 10, flexWrap: 'wrap',flexShrink: 1}}>{map.name}</Text>
                   { map.description ? (
                       <Text>{map.description}</Text>
                   ) : null}
                </TouchableOpacity>
                
                <TouchableOpacity style={{ width: '15%', alignItems: 'center', justifyContent: 'center'}}
                onPress={() => { 
                    navigation.navigate('mapComponentsScreen', {map: map._id})}
                }
                >
                    <Icon2 
                        name="map-marker-alt"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '15%', alignItems: 'center', justifyContent: 'center', borderBottomEndRadius: 30, borderTopEndRadius: 30}}
                onPress={() => { 
                    navigation.navigate('mapSettingsScreen', {map: map._id})}
                }
                >
                    <Feather 
                        name="settings"
                        color={'rgba(68, 68, 68, 1)'}
                        size={20}
                    />
                </TouchableOpacity>
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
        await fetch(config.server+'api/public/mymaps',{
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
                <Text>You have no maps</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('createMapScreen')}
                >
                    <Text style={{color: 'blue', fontStyle: 'italic'}}>Click here to create</Text>
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