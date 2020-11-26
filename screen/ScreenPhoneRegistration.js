/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
    Text,
    Image, TextInput,
    Dimensions, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, FlatList, Keyboard, Platform, NativeModules,
} from 'react-native';
import {
    c_text_green,
    HomeScreenName,
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    c_bg_blue,
    c_bg_grey,
    c_label_grey,
    SearchResultScreenName,
    c_dark_line,
    c_dark_line_opacity,
    c_inactive_dot,
    PhoneRegistrationScreenName,
    SmsVerificationScreenName,
    rq_verify_sms_code,
    apiUrl,
    rc_success,
    rq_login_with_phone,
    rq_register_with_phone, isForceRTL,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import { Switch } from 'react-native-switch';
import RNFloatingInput from '../comp/FloatingInput';
import AsyncStorage from '@react-native-community/async-storage';
import { StatusBarHeight } from '../resource/staus_bar_height'
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';

export default class PhoneRegistrationScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            userPhone:"",
            userCountryCode: "",
            firstName:"",
            lastName:"",
            email:"",
            busiAccountEnable:false,
            isReadTerm:false,
            canContinue: false,
            authKey:"",
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.userPhone = this.props.route.params.userPhone;
        allState.userCountryCode = this.props.route.params.userCountryCode;
        allState.authKey = this.props.route.params.authKey;
        this.setState(allState);
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        if (this.props.route != null && this.props.route.params != null){
            setTimeout(()=>{
                let allState = this.state;
                allState.userPhone = this.props.route.params.userPhone;
                allState.userCountryCode = this.props.route.params.userCountryCode;
                allState.authKey = this.props.route.params.authKey;
                this.setState(allState);
            },500)
        }
    }


    checkInvalidate = () =>{
        if (this.state.firstName != "" && this.state.lastName != ""
               && this.state.userPhone != "" && this.state.userCountryCode != ""
                && this.state.email != "" && this.state.isReadTerm){
            this.setState({canContinue: true});
        } else {
            this.setState({canContinue: false});
        }
    }

    registerWithPhone = async  () => {
        if (this.state.authKey != "") {
            this._showLoadingBox();
            let dataObj = {
                request: rq_register_with_phone,
                auth_key: this.state.authKey,
                first_name: this.state.firstName,
                last_name: this.state.lastName,
                email: this.state.email,
                is_business_acount: this.state.busiAccountEnable
            }
            console.log(dataObj);
            fetch(
                apiUrl,
                {
                    method: 'POST',
                    headers:{
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataObj)
                })
                .then ((response) => response.json())
                .then((responseJson) =>{
                    console.log(responseJson);
                    if (responseJson.rc == rc_success){
                        this.saveUserInfo(responseJson);
                    } else {
                        this._closeLoadingBox();
                        alert (responseJson.message);
                    }
                })
                .catch((error)=>{
                    this._closeLoadingBox();
                    alert (error);
                })
        }
    }

    saveUserInfo = async (dataJson) =>{
        Keyboard.dismiss();
        try {
            let userInfo = {
                token: dataJson.token,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                // token:""
            };
            AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo))
                .then(()=>{
                    this.props.navigation.jumpTo(HomeScreenName, {
                        showSideMenu:true
                    })
                });
        } catch (e) {
            this.props.navigation.jumpTo(HomeScreenName);
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
            <View style={{flex:1, flexDirection:"column", backgroundColor:'#ffffff'}}>
                <View style={{height: StatusBarHeight}}/>
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.goBack();
                    }}
                    style={{padding: 3, margin:10, alignSelf:'flex-end',width:screenWidth*0.09,height:screenWidth*0.09,
                        alignItems: 'center', justifyContent: 'center', backgroundColor: c_bg_grey, borderRadius: screenWidth*0.05}}>
                    <Image
                        source={require("../image/icon_arrow_left.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.03*(75/37),
                            height:screenWidth*0.3,
                        }}
                    />
                </TouchableOpacity>
                <Text style={[global.textBasicBoldStyle, mStyle.textWelcome,{marginStart:20}]}>{langObj.yourDetails}</Text>
                <Text style={[global.textBasicStyle, mStyle.textInstruction,{marginStart:20, marginTop:10}]}>{langObj.allFieldMandatory}</Text>
                <View style={{flexDirection:"row", alignItems:"center", marginStart:20, marginEnd:20, marginBottom: 10, marginTop:10}}>
                    <RNFloatingInput
                        editable={true}
                        label={langObj.firstName}
                        labelSize={12}
                        labelSizeLarge={14}
                        labelColor={c_label_grey}
                        textInputStyle={[global.textBasicStyle, globalStyle.textBasicStyle, mStyle.textInputEmail,{borderWidth:0, padding:0,margin:0, fontWeight:'bold',
                            textAlign:langObj.isRTL ? "right": "left"}]}
                        containerStyle={{margin:0, marginStart:2, padding:5,alignSelf:'stretch', flex:1}}
                        inputValue={this.state.firstName}
                        onChangeTextInput={(text) => {
                            this.setState({firstName: text}, ()=>this.checkInvalidate());
                        }}>
                    </RNFloatingInput>
                    <View style={{width:10}}/>
                    <RNFloatingInput
                        editable={true}
                        label={langObj.lastName}
                        labelSize={12}
                        labelSizeLarge={14}
                        labelColor={c_label_grey}
                        textInputStyle={[globalStyle.textBasicStyle, mStyle.textInputEmail,{borderWidth:0, padding:0,margin:0, fontWeight:'bold',
                            textAlign:langObj.isRTL ? "right": "left"}]}
                        containerStyle={{margin:0, marginStart:2, padding:5,alignSelf:'stretch', flex:1}}
                        value={this.state.lastName}
                        onChangeTextInput={(text) => {
                            this.setState({lastName: text}, ()=>this.checkInvalidate());
                        }}>
                    </RNFloatingInput>
                </View>
                <RNFloatingInput
                    editable={true}
                    label={langObj.yourEmail}
                    labelSize={12}
                    labelSizeLarge={14}
                    keyboardType={"email-address"}
                    labelColor={c_label_grey}
                    textInputStyle={[globalStyle.textBasicStyle, mStyle.textInputEmail,{borderWidth:0, padding:0,margin:0, fontWeight:'bold',
                        textAlign:langObj.isRTL ? "right": "left"}]}
                    containerStyle={{margin:0, marginStart:20, marginEnd:20, padding:5, }}
                    value={this.state.email}
                    onChangeTextInput={(text) => {
                        this.setState({email: text}, ()=>this.checkInvalidate());
                    }}>
                </RNFloatingInput>
                <Text style={[globalStyle.textBasicStyle, mStyle.textExplainReason,{marginStart:20, marginEnd:20, marginBottom:10, marginTop:3}]}>{langObj.emailNeedReason}</Text>
                <View style={{flexDirection: 'column', alignSelf:'stretch', marginStart:20, marginEnd:20, padding: 3,
                    borderRadius: 7, borderColor: c_dark_line, borderWidth:0.5, backgroundColor: c_dark_line_opacity}}>
                    <Text style={[mStyle.textExplainReason,{color:c_dark_line, paddingTop:5, paddingStart:5}]}>{langObj.yourPhoneNumber}</Text>
                    <Text
                        style={[globalStyle.textBasicStyle, mStyle.textInputEmail,{alignSelf:'stretch', margin:0, marginStart:2, padding:8,
                            textAlign: langObj.isRTL? "right" : "left"}]}
                    >{" (" + this.state.userCountryCode+ ") " + this.state.userPhone}</Text>
                </View>
                <Text style={[globalStyle.textBasicStyle, mStyle.textExplainReason,{marginStart:20, marginEnd:20, marginBottom:10, marginTop:3}]}>
                    {langObj.phoneNeedReason}
                </Text>
                <View style={{width:screenWidth-40, height:1, alignSelf: "center", marginBottom:10, backgroundColor: c_dark_line_opacity}}/>
                <View style={{flexDirection: 'row', alignItems: 'center', marginStart: 20, marginEnd:20}}>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textExplainReason]}>
                        {langObj.businessAccount}
                    </Text>
                    <View style={{flex:1}}/>
                    <Switch
                        value={this.state.busiAccountEnable}
                        onValueChange={(val) => {
                            this.setState({busiAccountEnable: val}, ()=>this.checkInvalidate())
                        }}
                        activeText={" "+ langObj.yes+" "}
                        inActiveText={" " + langObj.no+" "}
                        circleSize={30}
                        barHeight={30}
                        circleBorderWidth={0}
                        backgroundActive={c_text_green}
                        backgroundInactive={c_dark_line}
                        circleActiveColor={c_inactive_dot}
                        circleInActiveColor={c_inactive_dot}
                        changeValueImmediately={true}
                        innerCircleStyle={{ alignItems: "center", justifyContent: "center" }} // style for inner animated circle for what you (may) be rendering inside the circle
                        outerCircleStyle={{}} // style for outer animated circle
                        renderActiveText={true}
                        renderInActiveText={true}
                        switchLeftPx={2} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                        switchRightPx={2} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                        switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                        switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                    />
                </View>
                <Text style={[globalStyle.textBasicStyle, mStyle.textExplainReason,{marginStart:20, marginEnd:20, marginBottom:10, marginTop:3}]}>
                    {langObj.businessAccountExplain}
                </Text>
                <View style={{width:screenWidth-40, height:1, alignSelf: "center", marginBottom:10, backgroundColor: c_dark_line_opacity}}/>
                <View style={{flexDirection: 'row', alignItems: 'center', marginStart: 20, marginEnd:20}}>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textExplainReason]}>
                        {langObj.readAndApproveThe}
                    </Text>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textExplainReason, {color:c_text_green, marginStart:5}]}>
                        {langObj.termOfService}
                    </Text>
                    <View style={{flex:1}}/>
                    <Switch
                        value={this.state.isReadTerm}
                        onValueChange={(val) => {
                            this.setState({isReadTerm: val}, ()=>this.checkInvalidate())
                        }}
                        activeText={" "+ langObj.yes+" "}
                        inActiveText={" " + langObj.no+" "}
                        circleSize={30}
                        barHeight={30}
                        circleBorderWidth={0}
                        backgroundActive={c_text_green}
                        backgroundInactive={c_dark_line}
                        circleActiveColor={c_inactive_dot}
                        circleInActiveColor={c_inactive_dot}
                        changeValueImmediately={true}
                        innerCircleStyle={{ alignItems: "center", justifyContent: "center" }} // style for inner animated circle for what you (may) be rendering inside the circle
                        outerCircleStyle={{}} // style for outer animated circle
                        renderActiveText={true}
                        renderInActiveText={true}
                        switchLeftPx={2} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                        switchRightPx={2} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                        switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                        switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                    />
                </View>


                <View style={{flex:1}}/>
                <TouchableOpacity
                    onPress={()=>{
                        if (this.state.canContinue) {
                            this.registerWithPhone();
                        } else {
                            alert(langObj.allFieldMandatory);
                        }
                    }}
                    style={{flexDirection: 'row', marginStart: 20, marginEnd: 20, marginTop: 15, marginBottom:20 ,padding: 10,
                    alignSelf:'stretch', alignItems: 'center',
                    backgroundColor: this.state.canContinue? "rgb(18, 210, 179)" : "rgba(18, 210, 179,0.5)" , borderRadius: 7}}>
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textButton,{flex:1, textAlign:'center',
                    color: this.state.canContinue?"#ffffff": "rgba(0, 189, 133, 0.5)" }]}>{langObj.continue}</Text>
                </TouchableOpacity>
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
const mStyle = StyleSheet.create({
    textWelcome : {
        fontSize: 24,
    },
    textInstruction : {
        fontSize: 14,
    },
    textExplainReason : {
        fontSize: 12,
    },
    textInputEmail : {
        fontSize: 12,
    },
    textButton: {
        fontSize: 14,
    }
})
