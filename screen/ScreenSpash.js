/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
    Text,
    Image,
    Dimensions, ActivityIndicator, Alert, I18nManager, Platform, NativeModules,
} from 'react-native';
import {
    c_text_green,
    HomeScreenName,
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    LandingScreenName, isForceRTL, OrderSummaryScreenName,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';

export default class SplashScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        this.loadUserInfo();
    }

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                setTimeout(()=>{
                    this._closeLoadingBox();
                    this.props.navigation.jumpTo(HomeScreenName);
                    // this.props.navigation.jumpTo(OrderSummaryScreenName);
                }, 2000)
            } else {
                this.prepareUserInfo();
            }
        } catch(e) {
            // error reading value
            this.prepareUserInfo();
        }
    }

    prepareUserInfo = async () =>{
        try {
            let userInfo = {
                token:""
            };
            AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo))
                .then(()=>{
                    setTimeout(()=>{
                        this._closeLoadingBox();
                        this.props.navigation.jumpTo(HomeScreenName);
                        // this.props.navigation.jumpTo(OrderSummaryScreenName);
                    }, 2000)
                });
        } catch (e) {
            setTimeout(()=>{
                this._closeLoadingBox();
                this.props.navigation.jumpTo(HomeScreenName);
                // this.props.navigation.jumpTo(OrderSummaryScreenName);
            }, 2000)
        }
    }

    _showLoadingBox () {
        var allState = this.state;
        allState.indicatorSizeW = screenWidth;
        allState.indicatorSizeH = screenHeight;
        allState.indicatorDisplay = true;
        this.setState(allState);
    }

    _closeLoadingBox () {
        var allState = this.state;
        allState.indicatorSizeW = 0;
        allState.indicatorSizeH = 0;
        allState.indicatorDisplay = false;
        this.setState (allState);
    }


    render () {
        return (
            <View style={
                {flex:1, flexDirection:"column", alignItems:"center", justifyContent:'center', backgroundColor:c_text_green}}>
                <Text style={[globalStyle.textBasicBoldStyle,{color:"#ffffff", fontSize:30}]}>{langObj.appName}</Text>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
