import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SearchInput, { createFilter } from 'react-native-search-filter';
import Icon from 'react-native-vector-icons/FontAwesome';
import config from '../config/settings.json';
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