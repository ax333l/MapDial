import React from 'react'
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TextInput
} from 'react-native'
import config from '../config/settings'

import SearchInput, { createFilter } from 'react-native-search-filter';

const KEYS_TO_FILTERS = ['id', 'name'];

export default class PublicListScreen extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            searchTerm: '',
            publics: []
        }
    }

    componentDidMount(){
        fetch(config.server+'api/public/getAllPublics', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': this.props.route.params.authToken
            }
        })
        .then(response => response.json())
        .then(response => {
            this.setState({
                publics: response,
                isLoading: false
            })
        })
    }

    searchUpdated(term) {
        this.setState({ searchTerm: term })
    }

    render(){
        const filtered = this.state.publics.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        if(this.state.isLoading){
            return(
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Image
                    source={require('../assets/loading.gif')}
                    >
                    </Image>
                </View>
            )
        }
        return(
            <View style={styles.container}>
                <SearchInput 
                onChangeText={(term) => { this.searchUpdated(term) }} 
                style={styles.searchInput}
                placeholder="Type a message to search"
                />
                <ScrollView>
                {filtered.map(Public => {
                    return (
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('PublicInfo',{id: Public.id,authToken:this.props.route.params.authToken})} key={Public.id} style={styles.emailItem}>
                        <View>
                        <Text>{Public.id}</Text>
                        <Text style={styles.emailSubject}>{Public.name}</Text>
                        </View>
                    </TouchableOpacity>
                    )
                })}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      justifyContent: 'flex-start'
    },
    emailItem:{
      borderBottomWidth: 0.5,
      borderColor: 'rgba(0,0,0,0.3)',
      padding: 10
    },
    emailSubject: {
      color: 'rgba(0,0,0,0.5)'
    },
    searchInput:{
      padding: 10,
      borderColor: '#CCC',
      borderWidth: 1
    }
  });
  