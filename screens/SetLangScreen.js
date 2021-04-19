import React from 'react'
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, Button, View, SafeAreaView, Text, Alert } from 'react-native';

async function SetLang(lang){
    try {
        await AsyncStorage.setItem('lang', lang);
    } catch(e) {
        console.log(e);
    }
}

const SetLangScreen = () => {
    return (
        <View style={{flex: 1,alignItems:"center",justifyContent:"center"}} >
            <View style={{padding: 5,width: "60%"}}>
                <Button title="Русский" onPress={async () => await SetLang('ru')}></Button>
            </View>
            <View style={{padding: 5,width: "60%"}}>
                <Button title="English" onPress={async () => await SetLang('en')}></Button>
            </View>
        </View>
    )
}
export default SetLangScreen;