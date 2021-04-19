import React, {useContext} from 'react'
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
import { AuthContext } from '../components/context'

import Icon from 'react-native-vector-icons/FontAwesome';
import { setI18nConfig, translate } from '../components/localize';

function withMyHook(Component) {
    return function WrappedComponent(props) {
      const { signOut } = useContext(AuthContext)
      return <Component {...props} signOut={signOut}/>;
    }
}

class createScreen extends React.Component {
    constructor(props){
        super(props)
        setI18nConfig()
    }

    render(){
        return(
            <View style={{flex: 1,alignItems:"center",justifyContent:"center"}} >
                <View style={{padding: 5,width: "60%"}}>
                    <Button style={{flex: 1}} title={translate('publiclist')} onPress={() => {this.props.navigation.navigate('PublicList', {authToken: this.props.route.params.authToken})}}>Public List</Button>
                </View>
                <View style={{padding: 5,width: "60%"}}>
                    <Button style={{flex: 1}} title={translate('createpublic')} onPress={() => {this.props.navigation.navigate('CreatePublic', {authToken: this.props.route.params.authToken})}}>Create public</Button>
                </View>
                <View style={{padding: 5,width: "60%"}}>
                    <Button style={{flex: 1}} title={translate('createmarker')} onPress={() => {this.props.navigation.navigate('CreateMarker', {authToken: this.props.route.params.authToken,region:this.props.route.params.region,mapStyle:this.props.route.params.mapStyle})}}>Create marker</Button>
                </View>
                <View style={{padding: 5,width: "60%"}}>
                    <Button style={{flex: 1}} title={translate('myprofile')} onPress={() => {this.props.navigation.navigate('UserInfo', {authToken: this.props.route.params.authToken,name:this.props.route.params.name})}}>My profile</Button>
                </View>
                <View style={{bottom: 5,width: "30%",position: 'absolute'}}>
                    <Button style={{flex: 1}} title={translate('signout')} onPress={() => {
                        const signOut = this.props.signOut
                        signOut()
                    }}></Button>
                </View>
            </View>
        )
    }
}


export default withMyHook(createScreen)
