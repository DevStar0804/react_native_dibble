/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
	View, FlatList,
	Text, ScrollView,
	Image, StyleSheet,
	Dimensions, TextInput, Alert, TouchableOpacity, ActivityIndicator, Platform, NativeModules,
} from 'react-native';
import * as RNLocalize from "react-native-localize";
import {searchTextPadding, StatusBarHeight} from '../resource/staus_bar_height';
import {
	apiUrl,
	c_active_dot,
	c_dark_line,
	c_dark_text,
	c_inactive_dot,
	c_loading_icon,
	c_text_green,
	greyHasOpacity, isForceRTL,
	key_user_info,
	LandingScreenName,
	ProductDetailScreenName,
	rc_success,
	rq_get_category_products,
	rq_get_sub_categories,
	SearchResultScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchInput from './comp/SearchInput';

export default class CategoryScreen extends React.Component {
	constructor (props) {
		super(props);
		this.catFlatlist = React.createRef();
		this.state = ({
			searchText:"",
			isRefresh: true,
			category_id: "",
			category_name: "",
			indicatorSizeW: 0,
			indicatorSizeH: 0,
			indicatorDisplay: false,
			next_product_id: 0,
			products: [
			]
		})
	}


	componentDidMount (){
		console.log(RNLocalize.getLocales());
		RNLocalize.addEventListener("change", () => {
			// do localization related stuff…
		});
		let allState = this.state;
		allState.category_id = this.props.route.params.category_id;
		allState.category_name = this.props.route.params.category_name;
		this.setState(allState, ()=>{
			this.loadUserInfo();
		});
		console.log(this.state);
	}

	loadUserInfo = async  () => {
		try {
			const value = await AsyncStorage.getItem(key_user_info)
			if(value != null) {
				// value previously stored
				const jsonValue = JSON.parse(value);
				let allState = this.state;
				allState.userInfo = jsonValue;
				this.setState(allState);
				this.loadProductsInCategory(this.state.next_product_id);
			} else {

			}
		} catch(e) {
			// error reading value

		}
	}

	loadProductsInCategory = async (startProductId) =>{
		this._showLoadingBox();
		let dataObj = {
			request: rq_get_category_products,
			token: this.state.userInfo.token,
			category_id: this.state.category_id,
			start_with_product_id: startProductId
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
					let allState = this.state;
					allState.next_product_id = responseJson.next_product_id;
					allState.products = responseJson.products;
					this.setState(allState);
				}
				this._closeLoadingBox();
			})
			.catch((error)=>{
				this._closeLoadingBox();
				alert (error);
			})
	}

	componentWillReceiveProps(nextProps: Props, nextContext: *): * {
		// if (this.catFlatlist.current != null) {
		//     this.catFlatlist.current.scrollToOffset({ animated: true, offset: 0 });
		// }
		setTimeout(()=>{
			let allState = this.state;
			allState.category_id = this.props.route.params.category_id;
			allState.category_name = this.props.route.params.category_name;
			this.setState(allState, ()=>{
				this.loadProductsInCategory(this.state.next_product_id);
			});
		},500);
	}

	checkTokenForMenu = async  () => {
		try {
			const value = await AsyncStorage.getItem(key_user_info)
			if(value != null) {
				// value previously stored
				const jsonValue = JSON.parse(value);
				console.log(jsonValue);
				let allState = this.state;
				allState.userInfo = jsonValue;
				this.setState(allState);
				if (allState.userInfo.token == "") {
					this.props.navigation.navigate(LandingScreenName);
				} else {
					this.props.navigation.openDrawer();
				}
			} else {

			}
		} catch(e) {
			// error reading value

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
			<View style={{flex:1, flexDirection:"column", alignItems:"center", backgroundColor:'#ffffff'}}>
				<View style={{height: StatusBarHeight}}/>
				<View style={[globalStyle.header,{width:screenWidth, padding:5,flexDirection:'row',alignItems:'center',
					backgroundColor:"#ffffff",marginBottom:10}]}>
					<TouchableOpacity
						onPress={()=>{
							this.checkTokenForMenu();
						}}>
						<Image
							source={require("../image/icon_menu.png")}
							resizeMode="contain"
							style={{
								width:screenWidth*0.05*(159/123),
								height:screenWidth*0.05}}
						/>
					</TouchableOpacity>
					<View style={{flex:1, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
						<Text style={[globalStyle.textHeader]}>{langObj.deliveryTo}</Text>
						<View style={{flexDirection:"row", alignItems:'center'}}>
							<Image
								source={require("../image/icon_location.png")}
								resizeMode="contain"
								style={{
									width:screenWidth*0.03,
									height:screenWidth*0.03, marginEnd: 3}}
							/>
							<Text style={[globalStyle.textHeader,{color:c_text_green}]}>זאב ז’בוטינסקי 2, רמת גן</Text>
						</View>
					</View>
					<Image
						source={require("../image/icon_cart.png")}
						resizeMode="contain"
						style={{
							width:screenWidth*0.06,
							height:screenWidth*0.06}}
					/>
					<TouchableOpacity
						onPress={()=>{
							this.props.navigation.goBack();
						}}>
						<Image
							source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
							resizeMode="contain"
							style={{
								width:screenWidth*0.06,
								height:screenWidth*0.06,
								marginStart:10
							}}
						/>
					</TouchableOpacity>
				</View>
				<View style={{flex:1, flexDirection: 'column'}}>
					<SearchInput 
						wantToBuy = {langObj.wantToBuy} 
						navigation = {this.props.navigation} 
						style = {{flexDirection:'row', alignItems:'center', width: screenWidth-20, margin:10,
							borderColor: c_dark_line, borderRadius:20, borderWidth:0.5, paddingStart:10, paddingEnd:10}}
					/>
					<Text style={[globalStyle.textBasicBoldStyle, mStyle.textCategory]}>
						{this.state.category_name}
					</Text>
					<FlatList
						ref={this.catFlatlist}
						onEndReachedThreshold={0.3}
						onEndReached={()=>{
							console.log("onEndReached");
							if (this.state.next_product_id != 0) {
								this.loadProductsInCategory(this.state.next_product_id);
							}
						}}
						style={{ marginTop:0}}
						data={this.state.products}
						showsVerticalScrollIndicator={false}
						renderItem={({item, index}) =>
							<TouchableOpacity
								onPress={()=>{
									if (this.props.navigation.route != null) {
										this.props.navigation.route.setParams(
											{product_id: item.product_id}
										);
									} else {
										this.props.navigation.navigate(ProductDetailScreenName,
											{product_id: item.product_id});
									}
								}}
								style={[mStyle.itemContainer]}>
								<View
									style={{
										width:screenWidth*0.15,
										height:screenWidth*0.2,
										margin: 10,
										padding:0,
										borderRadius:10,
										shadowColor: "#000",
										backgroundColor:"#ffffff",
										shadowOffset: {
											width: 0,
											height: 1,
										},
										shadowOpacity: 0.15,
										shadowRadius: 3.84,
										elevation: 10
									}}>
									<Image
										source={{uri:item.image}}
										resizeMode="cover"
										style={{
											width:screenWidth*0.15,
											height:screenWidth*0.2,
											borderRadius:10}}
									/>
								</View>
								<View style={{flexDirection: 'column', flex:1, alignItems:'flex-start'}}>
									<Text
										numberOfLines={1}
										style={[globalStyle.textItemName]}>{item.name}</Text>
									<Text
										numberOfLines={3}
										style={[globalStyle.textItemDescription,{marginTop:0}]}>{item.description}</Text>
									<Text
										numberOfLines={1}
										style={[globalStyle.textItemDescription,{marginTop:0}]}>{langObj.priceStartFrom + " " + item.price}</Text>
								</View>
							</TouchableOpacity>
						}
						keyExtractor={(item) => item.product_id }
					/>
				</View>
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
	textCategory: {
		fontSize: 16,
		color:c_text_green,
		marginTop:15,
		marginStart:15,
		marginBottom:5,
		alignSelf: 'flex-start'
	},
	itemContainer : {
		width: screenWidth,
		flexDirection: "row",
		marginTop: 10,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: c_dark_line
	}
})
