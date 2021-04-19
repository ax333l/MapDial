import React, { useEffect, useState, useRef } from 'react';
import { Text, View, ActivityIndicator, Button, Image, Platform } from 'react-native';
import { NavigationContainer, StackActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'
import { createStackNavigator } from '@react-navigation/stack'
import FlashMessage, { showMessage } from "react-native-flash-message";
import { Notifications as Notifications2 } from 'expo';
import * as Notifications from 'expo-notifications';

import { sendPushNotification, registerForPushNotificationsAsync } from "./notification"

import { AuthContext } from './components/context'

import * as mainScreen from './screens/mainScreen'

import RootStackScreen from './screens/RootStackScreen'
import AppScreen from './screens/AppScreen'
import { NavigationActions } from 'react-navigation';


const Stack = createStackNavigator();

const App = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    lang: null
  };
  const loginReducer = (prevState, action) => {
    switch( action.type ) {
      case 'RETRIEVE_TOKEN': 
        return {
          ...prevState,
          userToken: action.userToken,
          isLoading: false,
        };
      case 'LOGIN': 
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGOUT': 
        return {
          ...prevState,
          userName: null,
          userToken: null,
          isLoading: false,
        };
      case 'REGISTER': 
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          isLoading: false,
        };
      case 'SETLANG': 
        return {
          ...prevState,
          lang: action.lang
        };
      default:
        return prevState;
    }
  };

  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

  const authContext = React.useMemo(() => ({
    signIn: async(foundUser) => {
      const userToken = String(foundUser.token);
      const userName = foundUser.name;
      
      try {
        await AsyncStorage.setItem('userToken', userToken);
      } catch(e) {
        console.log(e);
      }
      dispatch({ type: 'LOGIN', id: userName, token: userToken });
    },
    signOut: async() => {
      try {
        await AsyncStorage.removeItem('userToken');
      } catch(e) {
        console.log(e);
      }
      dispatch({ type: 'LOGOUT' });
    },
    signUp: async(foundUser) => {
      const userToken = foundUser.token;
      const userName = foundUser.name;
      try {
        await AsyncStorage.setItem('userToken', userToken);
      } catch(e) {
        console.log(e);
      }
      dispatch({ type: 'REGISTER', id: userName, token: userToken });
    },
    retrieve: async() => {
      dispatch({})
    }
  }), []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    Notifications2.addListener(notification => {
      setNotification(notification);
     /* if(notification.origin === 'selected'){
        console.log(123)
        const user = JSON.parse(await AsyncStorage.getItem('user'))
        const token = initialLoginState.userToken
        const data = notification.request.content.data
        mainScreen.navigate('customMapScreen', {user: user, map: data._id.toString(), token: token})
      }*/
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      //console.log(response);
      const user = JSON.parse(await AsyncStorage.getItem('user'))
      const token = await AsyncStorage.getItem('userToken')
      let data
      if(Platform.OS==='ios'){
          data = response.notification.request.content.data
      }
      else{
          data = JSON.parse(response.notification.request.trigger.remoteMessage.data.body)
      }
      mainScreen.navigate('customMapScreen', {user: user, map: data.id.toString(), token: token, initialRegion: {latitude: data.coords.latitude, longitude: data.coords.longitude, latitudeDelta: data.latitudeDelta, longitudeDelta: data.longitudeDelta}})
    });
    setTimeout(async() => {
      let userToken;
      userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch(e) {
        console.log(e);
      }
      try {
        let lang = await AsyncStorage.getItem('lang')
        if(lang)
          await AsyncStorage.setItem('lang', lang)
      }
      catch(e) {
        console.log(e)
      }
      dispatch({ type: 'RETRIEVE_TOKEN', userToken: userToken });
    }, 1000);
  }, []);

  if(loginState.isLoading){
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Image
          source={require('./assets/loading.gif')}
        >
        </Image>
      </View>
    )
  }

  if(!loginState.lang){
    return(
      <View style={{flex: 1,alignItems:"center",justifyContent:"center"}} >
          <View style={{padding: 5,width: "60%"}}>
              <Button title="Русский" onPress={dispatch({type: 'SETLANG', lang: 'ru'})}></Button>
          </View>
          <View style={{padding: 5,width: "60%"}}>
              <Button title="English" onPress={dispatch({type: 'SETLANG', lang: 'en'})}></Button>
          </View>
      </View>
    )
  }

  return (
    <View style={{flex: 1}}>
    <AuthContext.Provider value={authContext}>
      <NavigationContainer ref={mainScreen.navigationRef}>
        { loginState.userToken ? <AppScreen />
        /*(
          <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}>
            <Stack.Screen name="Map" component={MapScreen}></Stack.Screen>
            <Stack.Screen name="UserInfo" component={UserInfoScreen}></Stack.Screen>
            <Stack.Screen name="PublicInfo" component={PublicInfoScreen}></Stack.Screen>
            <Stack.Screen name="CreatePublic" component={createPublicScreen}></Stack.Screen>
            <Stack.Screen name="CreateScreen" component={createScreen}></Stack.Screen>
            <Stack.Screen name="CreateMarker" component={createMarkerScreen}></Stack.Screen>
            <Stack.Screen name="PublicList" component={PublicListScreen}></Stack.Screen>
            <Stack.Screen name="PublicSubs" component={PublicSubsListScreen}></Stack.Screen>
          </Stack.Navigator>
        )*/
        :
          <RootStackScreen />
      }
      </NavigationContainer>
    </AuthContext.Provider>
    <FlashMessage position="top" duration={5000} /> 
    </View>
  );
}

export default App;
