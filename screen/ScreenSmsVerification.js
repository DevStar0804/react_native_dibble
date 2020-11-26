/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
	View,
	Text,
	Image, TextInput, Keyboard,
	Dimensions, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, Platform, NativeModules,
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
	PhoneVerificationScreenName,
	PhoneRegistrationScreenName,
	c_dark_line,
	rq_login_with_phone,
	apiUrl,
	rc_success,
	rq_verify_sms_code,
	rq_send_sms_code, SmsVerificationScreenName, isForceRTL,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import { StatusBarHeight } from '../resource/staus_bar_height'
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';

export default class SmsVerificationScreen extends React.Component {
	constructor (props) {
		super(props);
		this.code1 = React.createRef();
		this.code2 = React.createRef();
		this.code3 = React.createRef();
		this.code4 = React.createRef();
		this.code5 = React.createRef();
		this.state = ({
			indicatorSizeW: 0,
			indicatorSizeH: 0,
			indicatorDisplay: false,
			userPhone:"",
			userCountryCode: "",
			isCode1Focus:false,
			isCode2Focus:false,
			isCode3Focus:false,
			isCode4Focus:false,
			isCode5Focus:false,
			code1:"",
			code2:"",
			code3:"",
			code4:"",
			code5:"",
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
		allState.code1 = "";
		allState.code2 = "";
		allState.code3 = "";
		allState.code4 = "";
		allState.code5 = "";
		this.setState(allState);
	}

	componentWillReceiveProps(nextProps: Props, nextContext: *): * {
		if (this.props.route != null && this.props.route.params != null){
			setTimeout(()=>{
				let allState = this.state;
				allState.userPhone = this.props.route.params.userPhone;
				allState.userCountryCode = this.props.route.params.userCountryCode;
				allState.code1 = "";
				allState.code2 = "";
				allState.code3 = "";
				allState.code4 = "";
				allState.code5 = "";
				this.setState(allState);
			},500)
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

	verifyCode = async () =>{
		if (this.state.code1 != "" && this.state.code2 != "" && this.state.code3 != ""
			&& this.state.code4 != "" && this.state.code5 != "") {
			this._showLoadingBox();
			let verifyCode = this.state.code1 + this.state.code2 + this.state.code3
				+ this.state.code4 + this.state.code5;
			let dataObj = {
				request: rq_verify_sms_code,
				phone_num: this.state.userCountryCode+this.state.userPhone,
				verification_code: verifyCode,
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
						if (responseJson.is_registered) {
							this.loginWithPhone(responseJson.auth_key);
						} else {
							this._closeLoadingBox();
							this.props.navigation.navigate(PhoneRegistrationScreenName, {
								userPhone: this.state.userPhone,
								userCountryCode: this.state.userCountryCode,
								authKey : responseJson.auth_key
							})
						}
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

	loginWithPhone = async (authKey) =>{
		this._showLoadingBox();
		let dataObj = {
			request: rq_login_with_phone,
			auth_key: authKey,
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
				this._closeLoadingBox();
				if (responseJson.rc == rc_success){
					this._closeLoadingBox();
					this.saveUserInfo(responseJson);
				} else {
					alert (responseJson.message);
				}
			})
			.catch((error)=>{
				this._closeLoadingBox();
				alert (error);
			})
	}

	saveUserInfo = async (dataJson) =>{
		Keyboard.dismiss();
		try {
			let userInfo = {
				token: dataJson.token,
				type: dataJson.type,
				firstName: dataJson.first_name,
				lastName: dataJson.last_name,
			};
			AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo))
				.then(()=>{
					this.props.navigation.jumpTo(HomeScreenName, {
						showSideMenu:true
					})
				});
		} catch (e) {
			alert (e);
		}
	}

	sendSmsCodeAgain = async () => {
		this._showLoadingBox()
		let dataObj = {
			request: rq_send_sms_code,
			phone_num: this.state.userCountryCode+this.state.userPhone,
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
				this._closeLoadingBox();
				alert (responseJson.message);
			})
			.catch((error)=>{
				this._closeLoadingBox();
				alert (error);
			})
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
				<View style={{flex:0.5}}/>
				<Text style={[global.textBasicBoldStyle, mStyle.textWelcome,{marginStart:20}]}>{langObj.smsVerificationTitle}</Text>
				<Text style={[globalStyle.textBasicStyle, mStyle.textInstruction,{marginStart:20, marginTop:10}]}>{langObj.enterCodeFromSms}</Text>


				<View style={{flexDirection:'row-reverse', justifyContent:'space-around', marginTop: 20, marginBottom: 20}}>
					<TextInput
						ref={this.code1}
						onChangeText={(text) => {
							this.setState({code1:text});
							this.code2.current.focus();
						}}
						style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
							{borderColor: this.state.isCode1Focus || this.state.code1 !="" ? c_text_green : c_dark_line}]}
						onFocus={()=>{
							this.setState({isCode1Focus: true})
						}}
						onBlur={()=>{
							this.setState({isCode1Focus: false})
						}}
						keyboardType={'numeric'}
						maxLength={1}
						autoFocus={true}
						value={this.state.code1}
					/>
					<TextInput
						ref={this.code2}
						onChangeText={(text) => {
							this.setState({code2:text});
							this.code3.current.focus();
						}}
						style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
							{borderColor: this.state.isCode2Focus || this.state.code2 !="" ? c_text_green : c_dark_line}]}
						onFocus={()=>{
							this.setState({isCode2Focus: true})
						}}
						onBlur={()=>{
							this.setState({isCode2Focus: false})
						}}
						keyboardType={'numeric'}
						maxLength={1}
						value={this.state.code2}
					/>
					<TextInput
						ref={this.code3}
						onChangeText={(text) => {
							this.setState({code3:text});
							this.code4.current.focus();
						}}
						style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
							{borderColor: this.state.isCode3Focus || this.state.code3 !="" ? c_text_green : c_dark_line}]}
						onFocus={()=>{
							this.setState({isCode3Focus: true})
						}}
						onBlur={()=>{
							this.setState({isCode3Focus: false})
						}}
						keyboardType={'numeric'}
						maxLength={1}
						value={this.state.code3}
					/>
					<TextInput
						ref={this.code4}
						onChangeText={(text) => {
							this.setState({code4:text});
							this.code5.current.focus();
						}}
						style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
							{borderColor: this.state.isCode4Focus || this.state.code4 !="" ? c_text_green : c_dark_line}]}
						onFocus={()=>{
							this.setState({isCode4Focus: true})
						}}
						onBlur={()=>{
							this.setState({isCode4Focus: false})
						}}
						keyboardType={'numeric'}
						maxLength={1}
						value={this.state.code4}
					/>
					<TextInput
						ref={this.code5}
						onChangeText={(text) => {
							this.setState({code5:text}, () => {
								this.verifyCode();
							});
						}}
						style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
							{borderColor: this.state.isCode5Focus || this.state.code5 !="" ? c_text_green : c_dark_line}]}
						onFocus={()=>{
							this.setState({isCode5Focus: true})
						}}
						onBlur={()=>{
							this.setState({isCode5Focus: false})
						}}
						keyboardType={'numeric'}
						maxLength={1}
						value={this.state.code5}
					/>
				</View>


				<TouchableOpacity
					onPress={()=>{
						this.sendSmsCodeAgain();
					}}
					style={[mStyle.buttonContainer]}>
					<Text style={[globalStyle.textBasicStyle, mStyle.textInstruction,{color:c_text_green}]}>{langObj.notReceiveCode}</Text>
				</TouchableOpacity>
				<View style={[mStyle.buttonContainer]}>
					<Text style={[globalStyle.textBasicStyle, mStyle.textInstruction,{color:c_text_green}]}>{langObj.customerSuport}</Text>
				</View>
				<View style={{flex:1}}/>
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
	textVerificationCode : {
		fontSize:24,
		textAlign: 'center',
		color:'#000000',
		borderWidth:1,
		borderRadius: 5,
		width:screenWidth*(1/7),
		height:screenWidth*(1/7),
		marginStart:10,
		marginEnd:10,
	},
	buttonContainer: {
		flexDirection: 'row',
		paddingBottom: 8,
		paddingTop: 8,
		paddingStart: 10,
		paddingEnd: 10,
		alignSelf:'flex-start',
		alignItems: 'center',
		justifyContent: 'center',
		marginStart: 20,
		marginTop:10,
		marginBottom:10,
		backgroundColor: '#ffffff',
		borderColor: c_text_green,
		borderWidth: 0.5,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	}
})
