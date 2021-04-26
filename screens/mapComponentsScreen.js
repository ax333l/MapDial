import React, { useEffect } from 'react'
import { loader } from './loader'
import AsyncStorage from '@react-native-community/async-storage'
import { Text, ScrollView, View, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import config from '../config/settings.json'
import Feather from 'react-native-vector-icons/Feather'
import { useTheme } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const mapComponentsScreen = ({ route, navigation }) => {
    const [userToken, setUserToken] = React.useState(null)

    const [data, setData] = React.useState({
        components: null
    })

    const { colors } = useTheme();

    const [dataToEdit, setDataToEdit] = React.useState(null)

    const [isLoading, setIsloading] = React.useState(true)

    const [isEdit, setIsEdit] = React.useState(false)

    const editComponent = async (id, i, dataToEdit) => {
        await fetch(config.server+'api/public/createcomponent',{
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': userToken
            },
            body: JSON.stringify({
                id: route.params.map,
                _id: id,
                variables: dataToEdit
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response.status){
                data.components[i].variables = dataToEdit
                setData({...data})
                setIsEdit(false)
            }
        })
    }

    const removeComponent = async (id, i) => {
        await fetch(config.server+'api/public/createcomponent',{
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': userToken
            },
            body: JSON.stringify({
                id: route.params.map,
                _id: id
            })
        })
        .then(response => {
            if(response.status){
                data.components.splice(i,1)
                setData({...data})
            }
        })
    }

    const RETRIEVE_TOKEN = async () => {
        const token = await AsyncStorage.getItem('userToken')
        setUserToken(token)
        await fetch(config.server+'api/public/map/'+route.params.map,{
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': token
            }
        })
        .then(response => response.json())
        .then(response => {
            setData({components: response.components})
            setIsloading(false)
        })
    }

    useEffect(() => {
        async function retrieve(){
            await RETRIEVE_TOKEN()
        }
        retrieve()
    }, [])

    if(isLoading){
        return (
            loader()
        )
    }

    if(data.components.length == 0) { 
        return (
            <View style={{justifyContent: "center", alignItems: "center", paddingTop: "50%"}}>
                <Text>No components found!</Text>
            </View>
        )
    }

    if(isEdit) {
        return(
            <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.text_header}>Edit</Text>
            </View>
            <Animatable.View 
            animation="fadeInUpBig"
            style={[styles.footer, {
                backgroundColor: colors.background
            }]}
            >
            <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Title</Text>
            <View style={styles.action}>
            <TextInput 
                    placeholder="Title"
                    value={dataToEdit.title}
                    placeholderTextColor="#666666"
                    style={[styles.textInput, {
                        color: colors.text
                    }]}
                    autoCapitalize="none"
                    onChangeText={(val) => {
                        const dataa = dataToEdit
                        dataa.title = val
                        setDataToEdit({...dataa})
                    }}
                />
            </View>
            <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Description</Text>
            <View style={styles.action}>
            <TextInput 
                    placeholder="Description"
                    value={dataToEdit.description}
                    placeholderTextColor="#666666"
                    style={[styles.textInput, {
                        color: colors.text
                    }]}
                    autoCapitalize="none"
                    onChangeText={(val) => {
                        const dataa = dataToEdit
                        dataa.description = val
                        setDataToEdit({...dataa})
                    }}
                />
            </View>
            {data.components[dataToEdit.i].variables.onPress? (
                <View>
                    <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Link</Text>
            <View style={styles.action}>
            <TextInput 
                    placeholder="Link"
                    value={dataToEdit.onPress}
                    placeholderTextColor="#666666"
                    style={[styles.textInput, {
                        color: colors.text
                    }]}
                    autoCapitalize="none"
                    onChangeText={(val) => {
                        const dataa = dataToEdit
                        dataa.onPress = val
                        setDataToEdit({...dataa})
                    }}
                />
            </View>
                </View>
            ):null}
            {data.components[dataToEdit.i].variables.pinColor? (
                <View>
                    <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Color</Text>
            <View style={styles.action}>
            <TextInput 
                    placeholder="Color"
                    value={dataToEdit.pinColor}
                    placeholderTextColor="#666666"
                    style={[styles.textInput, {
                        color: colors.text
                    }]}
                    autoCapitalize="none"
                    onChangeText={(val) => {
                        const dataa = dataToEdit
                        dataa.pinColor = val
                        setDataToEdit({...dataa})
                    }}
                />
            </View>
                </View>
            ):null}
            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => editComponent(dataToEdit.id, dataToEdit.i, dataToEdit)}
                >
                <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Edit</Text>
                </LinearGradient>
                </TouchableOpacity>
            </View>
            </Animatable.View>
            </View>
        )
    }

    return (
        <ScrollView style={{flex: 1, paddingTop: 20, paddingBottom: 20}}>
            {data.components.map((component, i) => {
                return(
                    <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 10, flexDirection: 'row', borderColor: 'rgba(143, 143, 143, 0.75);', borderWidth: 0, borderRadius: 50, padding: 10, paddingLeft: 10, margin: 10}} key={component._id.toString()}>
                        <TouchableOpacity
                            style={{width: '80%', alignItems: "center", paddingHorizontal: 10, borderEndWidth: 0, borderEndColor: 'rgba(100,100,200,0.6)' }}
                            onPress={() => {}}
                            key={component._id.toString()}
                        >
                            <Text style={{flex: 1, flexDirection:'row', color: "rgba(68, 68, 68, 1)", fontSize: 20, textAlign: 'center', justifyContent: 'center', alignContent: 'center', padding: 10, flexWrap: 'wrap',flexShrink: 1}}>{component.variables.title}</Text>

                            { component.variables.description ? (
                       <Text>{component.variables.description}</Text>
                   ) : null}

                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '10%', alignItems: 'center', justifyContent: 'center', borderEndWidth: 0, borderEndColor: 'rgba(100,100,200,0.6)'}}
                        onPress={() => {
                            const DATA = {
                                ...component.variables,
                                id: component._id.toString(),
                                i: i
                            }
                            setDataToEdit(DATA)
                            setIsEdit(true)
                        }}
                        >
                            <Feather 
                                name="edit"
                                color={'rgba(68, 68, 68, 1)'}
                                size={20}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '10%', alignItems: 'center', justifyContent: 'center', borderEndWidth: 0, borderEndColor: 'rgba(100,100,200,0.6)'}}
                        onPress={() => {
                            removeComponent(component._id.toString(),i)
                        }}
                        >
                            <Feather 
                                name="x"
                                color={'rgba(68, 68, 68, 1)'}
                                size={20}
                            />
                        </TouchableOpacity>
                    </View>
                )
            })}
        </ScrollView>
    )
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
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
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
        fontSize: 14
    },
    action: {
        flexDirection: 'row',
        marginTop: 5,
        borderBottomWidth: 3,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 1,
        marginHorizontal: "10%"
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 1
    },
    textInput: {
        flex: 1,
        marginTop: "10%",
        paddingLeft: 10,
        color: '#05375a',
        fontSize: 16
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

export default mapComponentsScreen