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
                <TouchableOpacity style={{ width: '10%', backgroundColor: '#29C584', alignItems: 'center', justifyContent: 'center', borderEndWidth: 1, borderEndColor: 'rgba(100,100,200,0.6)'}}
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
                <TouchableOpacity style={{ width: '10%', backgroundColor: '#29C584', alignItems: 'center', justifyContent: 'center'}}
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
            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', margin: 30, marginBottom: 10, flexDirection: 'row', borderColor: 'rgba(100,100,200,0.6)', borderWidth: 3}}>
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

export default myMapsScreen