import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import mainScreen from './mainScreen'
import customMapScreen from './customMapScreen';
import createMapScreen from './createMapScreen'
import myMapsScreen from './myMapsScreen'
import enteredMapsScreen from './enteredMapsScreen'
import mapSettingsScreen from './mapSettingsScreen';
import mapComponentsScreen from './mapComponentsScreen'

const RootStack = createStackNavigator();

const Tab = createBottomTabNavigator();


function Home() {
    return (
        <Tab.Navigator
        initialRouteName="mainScreen"
        tabBarOptions={{
            activeTintColor: '#e91e63',
        }}
        >
            <Tab.Screen 
            name="mainScreen" component={mainScreen}
            options={{
                tabBarLabel: 'Maps',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="home" color={color} size={size} />
                ),
            }}></Tab.Screen>
            <Tab.Screen name="createMapScreen" component={createMapScreen}
            options={{
                tabBarLabel: 'Create map',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="plus" color={color} size={size} />
                ),
            }}></Tab.Screen>
            <Tab.Screen name="enteredMaps" component={enteredMapsScreen}
            options={{
                tabBarLabel: 'Entered maps',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="map-outline" color={color} size={size} />
                ),
            }}></Tab.Screen>
            <Tab.Screen name="myMaps" component={myMapsScreen}
            options={{
                tabBarLabel: 'My maps',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="map" color={color} size={size} />
                ),
            }}></Tab.Screen>
        </Tab.Navigator>
    );
}

const AppScreen = ({navigation}) => (
    <RootStack.Navigator headerMode='none'>
        <RootStack.Screen name="mainScreen" component={Home}></RootStack.Screen>
        <RootStack.Screen name="customMapScreen" component={customMapScreen}></RootStack.Screen>
        <RootStack.Screen name="mapSettingsScreen" component={mapSettingsScreen}></RootStack.Screen>
        <RootStack.Screen name="mapComponentsScreen" component={mapComponentsScreen}></RootStack.Screen>
    </RootStack.Navigator>
)

export default AppScreen;