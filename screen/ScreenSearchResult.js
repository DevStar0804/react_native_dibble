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
	Dimensions, TextInput, Alert, TouchableOpacity, ActivityIndicator, Platform, NativeModules, I18nManager,
} from 'react-native';
import * as RNLocalize from "react-native-localize";
import {
	apiUrl,
	c_bg_search_box_dark,
	c_dark_line,
	c_dark_text,
	c_inactive_dot,
	c_loading_icon,
	c_text_green,
	greyHasOpacity, isForceRTL,
	key_user_info, LandingScreenName,
	ProductDetailScreenName,
	rc_success,
	rq_get_category_products,
	rq_search_products,
	SearchResultScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import {searchTextPadding, StatusBarHeight} from '../resource/staus_bar_height';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchInput from './comp/SearchInput';	

export default class SearchResultScreen extends React.Component {
	constructor (props) {
		super(props);
		this.flatlist = React.createRef();
		this.state = ({
			searchText:"אימפקט",
			isRefresh: true,
			indicatorSizeW: 0,
			indicatorSizeH: 0,
			next_product_id: 0,
			indicatorDisplay: false,
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
		allState.searchText = this.props.route.params.searchText;
		this.setState(allState, ()=>{
			this.loadUserInfo();
		});
		console.log(this.state);
	}

	componentWillReceiveProps(nextProps: Props, nextContext: *): * {
		if (this.flatlist != null && this.flatlist.current != null) {
			this.flatlist.current.scrollToOffset({offset: 0});
		}
		setTimeout(()=>{
			if(this.props.route.params.searchText != null) {
				let allState = this.state;
				allState.next_product_id = 0;
				allState.searchText = this.props.route.params.searchText;
				this.setState(allState, () =>{
					this.startSearch(0);
				})
			}
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

	loadUserInfo = async  () => {
		try {
			const value = await AsyncStorage.getItem(key_user_info)
			if(value != null) {
				// value previously stored
				const jsonValue = JSON.parse(value);
				let allState = this.state;
				allState.userInfo = jsonValue;
				this.setState(allState);
				this.startSearch(this.state.next_product_id);
			} else {

			}
		} catch(e) {
			// error reading value

		}
	}

	startSearch = async (startProductId) => {
		this._showLoadingBox();
		let dataObj = {
			request: rq_search_products,
			token: this.state.userInfo.token,
			search_phrase: this.state.searchText,
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
					if (allState.next_product_id == 0) {
						allState.products = responseJson.products;
					} else {
						for (let i = 0; i < responseJson.products.length; i++) {
							allState.products.push(responseJson.products[i]);
						}
					}
					allState.next_product_id = responseJson.next_product_id;
					this.setState(allState);
				}
				this._closeLoadingBox();
			})
			.catch((error)=>{
				this._closeLoadingBox();
				alert (error);
			})
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

	getListCategoriesNameString (categories) {
		let categoryNameList = "";
		for (let i = 0; i < categories.length; i++) {
			if (categoryNameList == "") {
				categoryNameList = categories[i]['category_name'];
			} else {
				categoryNameList = categoryNameList + " - " + categories[i]['category_name'];
			}
		}
		return categoryNameList;
	}

	render () {
		return (
			<View style={{flex:1, flexDirection:"column", backgroundColor:'#ffffff'}}>
				<View style={{height: StatusBarHeight}}/>
				<View style={[globalStyle.header,{width:screenWidth, paddingStart:5, paddingEnd:5,flexDirection:'row',alignItems:'center',
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
					<View style={{flexDirection:'row', alignItems:'center', flex:1, margin:10,
						backgroundColor:c_bg_search_box_dark, borderRadius:10, paddingStart:10, paddingEnd:10}}>
						<SearchInput 
							wantToBuy={langObj.wantToBuy} 
							navigation={this.props.navigation} 
							style={{flexDirection:'row', alignItems:'center', flex:1, margin:10,
							backgroundColor:'#fff', borderRadius:20, borderWidth:0.5, paddingStart:10, paddingEnd:10}}
						/>
						<TextInput
							style={[globalStyle.textSearch,{flex:1, margin:0,padding:searchTextPadding}]}
							value={this.state.searchText}
							onSubmitEditing={()=>{
								this.startSearch(this.state.next_product_id);
							}}
							onChangeText={(text)=>{
								this.setState({searchText: text})
							}}
						/>
					</View>
					<TouchableOpacity
						style={{marginStart:20, marginEnd: 10, flexDirection: 'row', alignItems:'center'}}
						onPress={()=>{
							this.props.navigation.goBack();
						}}>
						<Image
							source={require("../image/icon_cart.png")}
							resizeMode="contain"
							style={{
								width:screenWidth*0.06,
								height:screenWidth*0.06, marginEnd:10}}
						/>
						<Image
							source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
							resizeMode="contain"
							style={{
								width:screenWidth*0.045*(70/139),
								height:screenWidth*0.045
							}}
						/>
					</TouchableOpacity>
				</View>
				<View style={{flexDirection: "row", alignItems:'flex-start',margin: 5}}>
					<Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.searchResultFor}</Text>
					<Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{marginStart:5}]}>{this.state.searchText}</Text>
				</View>
				<View style={{flex:1, flexDirection: 'column'}}>
					<FlatList
						ref={this.flatlist}
						onEndReachedThreshold={0.3}
						onEndReached={()=>{
							console.log("onEndReached");
							if (this.state.next_product_id != 0) {
								this.startSearch(this.state.next_product_id);
							}
						}}
						style={{ marginTop:10}}
						data={this.state.products}
						showsVerticalScrollIndicator={false}
						renderItem={({item, index}) =>
							<TouchableOpacity
								onPress={()=>{
									this.props.navigation.navigate(ProductDetailScreenName,
										{product_id: item.product_id});
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
										source={{uri: item.image}}
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
									<View style={{flexDirection: 'row', alignItems:'center'}}>
										<Text
											numberOfLines={1}
											style={[globalStyle.textItemDescription]}>{langObj.priceStartFrom + " " + item.price}</Text>
										<View style={{width:5, height:5,borderRadius:5, backgroundColor:"#000000"}}>

										</View>
										<Text
											numberOfLines={1}
											style={[globalStyle.textItemDescription,{color:c_text_green}]}>{this.getListCategoriesNameString(item.categories)}</Text>
									</View>
								</View>
							</TouchableOpacity>
						}
						keyExtractor={(item) => item.product_id}
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
	textLabel: {
		fontSize: 15,
	},
	itemContainer :{
		width:screenWidth,
		flexDirection: "row",
		marginTop:10,
		paddingBottom:10,
		borderBottomWidth:1,
		borderBottomColor: c_dark_line
	}
})
