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
    c_active_dot,
    c_dark_line,
    c_dark_line_opacity,
    c_dark_text,
    c_inactive_dot,
    c_loading_icon,
    c_text_green,
    greyHasOpacity, isForceRTL,
    key_user_info,
    LandingScreenName, OrderSummaryScreenName,
    rc_success, rq_add_products_to_order,
    rq_get_category_products,
    rq_get_product,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import { StatusBarHeight } from '../resource/staus_bar_height'
import getLanguage from '../resource/LanguageSupport';
import {makeAPostRequest} from '../resource/SupportFunction';
import {globalStyle} from '../resource/style/GlobalStyle';

export default class ProductDetailScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            productInfo: {
            }
        })
    }


    componentDidMount (){
        console.log("componentDidMount");
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.product_id = this.props.route.params.product_id;
        this.setState(allState, ()=>{
            this.loadUserInfo();
        });
        console.log(this.props.route);
    }


    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        console.log("componentWillReceiveProps");
        console.log(this.props);
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null
                && this.props.route.params.product_id != null) {
                console.log(this.props.route);
                let allState = this.state;
                allState.product_id = this.props.route.params.product_id;
                this.setState(allState, ()=>{
                    this.loadUserInfo();
                });
            }
        }, 500);
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

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState);
                this.loadProductDetails();
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    loadProductDetails = async () => {
        this._showLoadingBox();
        let dataObj = {
            request: rq_get_product,
            token: this.state.userInfo.token,
            product_id: this.state.product_id,
        }
        makeAPostRequest(dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseJson)=>{
                if(isSuccess) {
                    let allState = this.state;
                    allState.productInfo = responseJson;
                    allState.productInfo.isLiked = false;
                    allState.productInfo.other_images.push({
                        image:allState.productInfo.image
                    })
                    allState.productInfo.imageViewFull = allState.productInfo.image;
                    this.state.productInfo.purchaseAmount = 1;
                    this.setState(allState);
                } else {
                    alert (responseJson);
                }
            });
    }

    displayImageList () {
        let imageLayout = [];
        if (this.state.productInfo.other_images != null) {
            for (let i = 0; i < this.state.productInfo.other_images.length; i++) {
                imageLayout.push(
                    <TouchableOpacity
                        onPress={() => {
                            let allState = this.state;
                            allState.productInfo.imageViewFull = allState.productInfo.other_images[i]['image'];
                            this.setState(allState);
                        }}
                        style={{width:screenWidth*0.1,
                            height:screenWidth*0.1,
                            padding:1,
                            borderRadius:10,
                            overflow:'hidden',
                            margin: 2,
                            shadowColor: "#3e3e3e",
                            shadowOffset: {
                                width: 0,
                                height: 0,
                            },
                            shadowOpacity: 0.1,
                            shadowRadius: 1,
                            elevation: 10}}>
                        <Image
                            source={{uri: this.state.productInfo.other_images[i]['image']}}
                            resizeMode="cover"
                            style={{
                                width:screenWidth*0.1-2,
                                height:screenWidth*0.1-2,
                                borderRadius:5}}
                        />
                    </TouchableOpacity>
                )
            }
        }
        return imageLayout;
    }

    displayProductDetail () {
        let detailedContent = [];
        if (this.state.productInfo.details != null) {
            for (let i = 0; i < this.state.productInfo.details.length; i++) {
                let detailsItem = this.state.productInfo.details[i];
                detailedContent.push(
                    <Text style={[globalStyle.textBasicStyle, mStyle.itemDescription]}>{detailsItem['name'] + ": " + detailsItem['details']}</Text>
                )
            }
        }
        return detailedContent;
    }

    addProductToOrder = async () => {
        this._showLoadingBox();
        let productsList = [];
        let productItem = {
            product_id: this.state.product_id,
            amount:this.state.productInfo.purchaseAmount
        }
        productsList.push(productItem);
        let dataObj = {
            request: rq_add_products_to_order,
            token: this.state.userInfo.token,
            products: productsList
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
                    this.props.navigation.jumpTo(OrderSummaryScreenName, {
                        orderId :responseJson.order_id
                    });
                } else {
                    alert (responseJson.message);
                }
            })
            .catch((error)=>{
                this._closeLoadingBox();
                alert (error);
            })


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
                <View style={{flex:1, flexDirection: 'column'}}>
                    <ScrollView style={{flex:1, width:screenWidth}}>
                        <View style={{flexDirection: 'row', height:screenWidth*0.55, alignItems:'center'}}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={{width:screenWidth*0.4, marginStart: 10}}>
                                {this.displayImageList()}
                            </ScrollView>
                            <Image
                                source={{uri:this.state.productInfo.imageViewFull}}
                                resizeMode="cover"
                                style={{
                                    width:screenWidth*0.5,
                                    height:screenWidth*0.5,
                                    marginEnd: 30,
                                    alignSelf:'center'}}
                            />
                        </View>
                        <View style={{width:screenWidth, height:1, backgroundColor:c_dark_line_opacity}}/>
                        <View style={{flexDirection: "row",alignItems:'center', padding:10, paddingBottom:0}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.itemName,{flex:1}]}>{this.state.productInfo.name}</Text>
                            <TouchableOpacity
                                onPress={()=>{
                                    let allState = this.state;
                                    allState.productInfo.isLiked = !allState.productInfo.isLiked;
                                    this.setState(allState);
                                }}>
                                <Image
                                    source={this.state.productInfo.isLiked ? require('../image/icon_heart_enable.png') : require('../image/icon_heart_disable.png')}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.05,
                                        height:screenWidth*0.05}}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.itemDescription,{paddingStart:10, paddingEnd:10,paddingBottom:0}]}>{this.state.productInfo.description}</Text>
                        <Text style={[globalStyle.textBasicStyle, mStyle.itemDescription,{fontWeight:'bold',paddingStart:10, paddingEnd:10,paddingTop:0,marginTop:0,
                            color:c_text_green, alignSelf: 'flex-start'}]}>
                            {this.state.productInfo.price}
                        </Text>
                        <View style={{width:screenWidth, height:1, backgroundColor:c_dark_line_opacity}}/>
                        <View style={{width:screenWidth, flexDirection: 'row', alignItems:'center'}}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.itemDescription,{paddingStart:10, paddingEnd:10,paddingBottom:0, flex:1}]}>{langObj.amount + " " + this.state.productInfo.purchaseAmount}</Text>
                            <View style={{flexDirection: 'row', borderWidth:1, borderRadius:8, borderColor:c_dark_line_opacity,
                                alignItems:'center', margin: 10}}>
                                <TouchableOpacity
                                    onPress={()=>{
                                        if (this.state.productInfo.purchaseAmount > 1) {
                                            let allState = this.state;
                                            allState.productInfo.purchaseAmount = allState.productInfo.purchaseAmount -1;
                                            this.setState(allState);
                                        }
                                    }}
                                    style={{
                                        width:screenWidth*0.1, height: screenWidth*0.1, alignItems:'center', justifyContent:'center'
                                    }}>
                                    <Image
                                        source={require('../image/icon_devide.png')}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.03,
                                            height:screenWidth*0.03*(18/108)}}
                                    />
                                </TouchableOpacity>
                                <View style={{width:1, height:screenWidth*0.1, backgroundColor:c_dark_line_opacity}}/>
                                <TouchableOpacity
                                    onPress={()=>{
                                        let allState = this.state;
                                        allState.productInfo.purchaseAmount = allState.productInfo.purchaseAmount + 1;
                                        this.setState(allState);
                                    }}
                                    style={{
                                        width:screenWidth*0.1, height: screenWidth*0.1, alignItems:'center', justifyContent:'center'
                                    }}>
                                    <Image
                                        source={require('../image/icon_plus.png')}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.03,
                                            height:screenWidth*0.03}}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{width:screenWidth, height:1, backgroundColor:c_dark_line_opacity}}/>
                        <View style={{flex:1, width:screenWidth, paddingStart:10, paddingEnd:10}}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.itemDescription,{color:c_text_green}]}>{langObj.moreDetail}</Text>
                            {this.displayProductDetail()}
                        </View>
                    </ScrollView>
                    <View style={{width:screenWidth, height:1, backgroundColor:c_dark_line_opacity}}/>
                    <View style={{width:screenWidth, flexDirection: 'row'}}>
                        <TouchableOpacity
                            style={{flex:1, alignItems:'center', justifyContent:'center',
                                padding:10, backgroundColor:'#ffffff'}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.itemName,{color:c_text_green}]}>{langObj.addToCart}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>{
                                this.addProductToOrder();
                            }}
                            style={{flex:1, alignItems:'center', justifyContent:'center',
                                padding:10, backgroundColor:c_text_green}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.itemName,{color:'#ffffff'}]}>{langObj.goToPayment}</Text>
                        </TouchableOpacity>
                    </View>
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
    itemName: {
        fontSize: 15,
        marginStart:5,
        marginEnd: 5,
        marginTop: 5,
    },
    itemDescription: {
        fontSize: 13,
        margin:5,
    }
})
