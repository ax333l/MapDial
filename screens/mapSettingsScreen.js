import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Clipboard, Dimensions, ScrollView } from 'react-native'
import config from '../config/settings.json'
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns'
import { LineChart } from 'react-native-chart-kit' 
import { loader } from './loader'

const mapSettingsScreen = ({ route, navigation }) => {

    const [userToken, setUserToken] = React.useState(null)

    const [data, setData] = React.useState(null)

    const [isLoading, setIsloading] = React.useState(true)

    const [showStatistic, setShowStatistic] = React.useState(false)

    const [chart, setChart] = React.useState(null)

    const RETRIEVE_TOKEN = async () => {
        const token = await AsyncStorage.getItem('userToken')
        setUserToken(token)
        await fetch(config.server+'api/public/mapsettings',{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': token
            },
            body: JSON.stringify({
                map: route.params.map
            })
        })
        .then(response => response.json())
        .then(response => {
            setData(response)
            let labels = []
            let dataset = []
            response.visits.map(visit => {
                labels.push(format(parseISO(visit.day),'MM-dd'))
                dataset.push(visit.visits)
            })
            setChart({labels: labels, data: dataset})
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

    return (
        <ScrollView style={{flex: 1}}>
            <View style={{alignItems: "center", justifyContent: 'center', flex: 1}}>
                <TouchableOpacity style={{margin: 10, backgroundColor: '#4C905F', marginTop: 40, padding: 10, borderRadius: 50, padding: 15, width: 140, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}} onPress={() => {
                        showStatistic?setShowStatistic(false):setShowStatistic(true)
                    }}>
                    <Text style={{ color: "#FFF" }}>Show statistic</Text>
                    <Icon 
                        style={{ marginLeft: 7, color: '#FFF' }}
                        name="dotchart"
                        size={20}
                        />
                </TouchableOpacity>
                { showStatistic ? (
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <LineChart
                        data={{
                        labels: chart.labels,
                        datasets: [{
                            data: chart.data
                        }]
                        }}
                        width={Dimensions.get('window').width-20} // from react-native
                        height={220}
                        chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        }
                        }}
                        bezier
                        style={{
                        marginVertical: 8,
                        borderRadius: 16
                        }}
                    />
                    </View>
                ) : null}
                <TouchableOpacity style={{margin: 10, backgroundColor: '#514898', borderRadius: 50, padding: 15, width: 140, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}} onPress={() => {
                    Clipboard.setString(data.api_key)
                    }}>
                    <Text style={{ color: '#FFF' }}>Show users</Text>
                    <Icon2
                        name='users'
                        size={20}
                        style={{ marginLeft: 7, color: "#FFF" }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={{marginTop:10, backgroundColor: "rgba(143, 143, 143, 0.75)", padding: 15, borderRadius: 50, width: 140, alignItems: 'center'}} onPress={() => {
                    Clipboard.setString(data.api_key)
                    }}>
                    <Text style={{ color: '#FFF' }}>Copy api key</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}
    
export default mapSettingsScreen