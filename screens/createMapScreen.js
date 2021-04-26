import React, { useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TextInput } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config/settings.json'
import AsyncStorage from '@react-native-community/async-storage'
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Feather';
import { showMessage } from "react-native-flash-message";

const createMapScreen = ({ route, navigation }) => {

    const handleCreate = () => {
        fetch(config.server+'api/public/map/create', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': userToken
            },
            body: JSON.stringify({
                name: name,
                desciption: desciption,
                scope: selectedItems
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response.status){
                showMessage({
                    type: "success",
                    message: "Map Created"
                })
                navigation.navigate('customMapScreen', {
                    map: response.response,
                    user: user,
                    token: userToken
                })
            }
            else{
                showMessage({
                    type: "warning",
                    message: JSON.stringify(response.response)
                })
            }
        })
    }



    const [name, setName] = React.useState(null)

    const [desciption, setDescription] = React.useState(null)
    
    const [userToken, setUserToken] = React.useState(null)

    const [user, setUser] = React.useState(null)

    const [items, setItems] = React.useState([{
        id: 'NOTIFICATION',
        name: 'NOTIFICATION',
      }, {
        id: 'LOCATION',
        name: 'LOCATION',
      },
      {
        id: 'MAPREF',
        name: 'MAPREF',
      }
    ])
      
    const [selectedItems, setSelectedItems] = React.useState([])
    
    const RETRIEVE_TOKEN = async () => {
        const token = await AsyncStorage.getItem('userToken')
        setUserToken(token)
        const users = JSON.parse(await AsyncStorage.getItem('user'))
        setUser(users)
    }

    useEffect(() => {
        async function retrieve(){
            await RETRIEVE_TOKEN()
        }
        retrieve()
    }, [])

    return (
        <ScrollView style={{flex: 1, marginTop: 20}}>

            <Text style={{ fontSize: 40, marginTop: 15, textAlign: 'center', marginBottom: 10, color: "rgba(143, 143, 143, 0.75);" }}>Create map</Text>

            <TextInput
                placeholder="Name"
                placeholderTextColor="#666"
                style={{margin: 10, marginBottom: 0, padding: 10, borderTopLeftRadius: 30, borderTopRightRadius: 30}}
                onChangeText={(text) => setName(text)}
                editable
                multiline
                underlineColorAndroid="transparent"
            >
            </TextInput>
            <TextInput
                placeholder="Description"
                placeholderTextColor="#666"
                style={{margin: 10, marginTop: 0, paddingTop: 10, paddingBottom: 30}}
                onChangeText={(text) => setDescription(text)}
                editable
                multiline
                underlineColorAndroid="transparent"
            >
            </TextInput>
            <View style={{flex: 1, margin: 10, alignItems: 'center'}}>
                <Text style={{color: 'rgba(143, 143, 143, 0.75);', fontSize: 18}}>
                    Select scopes
                </Text>
            </View>
            <DropDownPicker
                items={[
                    {label: 'NOTIFICATION', value: 'NOTIFICATION', icon: () => <Icon name="bell" size={18} color="#900" />},
                    {label: 'LOCATION', value: 'LOCATION', icon: () => <Icon name="navigation" size={18} color="#900" />},
                    {label: 'MAPREF', value: 'MAPREF', icon: () => <Icon name="map" size={18} color="#900" />},
                ]}
            
                multiple={true}
                multipleText="%d items have been selected."
                min={0}
                max={10}
            
                defaultValue={selectedItems}
                containerStyle={{height: 40}}
                itemStyle={{
                    justifyContent: 'flex-start'
                }}
                onChangeItem={item => setSelectedItems(item)}
                style = {{ marginLeft: 10, marginRight: 10, borderRadius: 50 }}
            />

            <TouchableOpacity style={{alignItems: 'center', margin: 40}}
            onPress={() => handleCreate()}
            >
            <LinearGradient
                colors={['#554BA7', '#554BA7']}
                style={{height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 50, width: 100}}
            >
                <Text style={{color: '#FFF', fontSize: 18}}>Create</Text>
            </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    )
}

export default createMapScreen