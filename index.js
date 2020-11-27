/**
 * @format
 */

import {AppRegistry, I18nManager, Image} from 'react-native';
import * as React from 'react';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import {
  SplashScreenName,
  HomeScreenName,
  CategoryScreenName,
  SearchResultScreenName,
  ProductDetailScreenName,
  UserScreenName,
  LandingScreenName,
  PhoneVerificationScreenName,
  PhoneInputScreenName,
  PhoneRegistrationScreenName,
  SmsVerificationScreenName,
  key_current_route_name,
  key_user_info,
  isForceRTL, OrderSummaryScreenName,
} from './resource/BaseValue';
import {NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import SplashScreen from './screen/ScreenSpash';
import HomeScreen from './screen/ScreenHome';
import CategoryScreen from './screen/ScreenCategory';
import CustomDrawerSideMenu from './screen/DrawerSideMenu';
import SearchResultScreen from './screen/ScreenSearchResult';
import ProductDetailScreen from './screen/ScreenProductDetail';
import LandingScreen from './screen/ScreenLanding';
import PhoneInputScreen from './screen/ScreenPhoneInput';
import PhoneRegistrationScreen from './screen/ScreenPhoneRegistration';
import SmsVerificationScreen from './screen/ScreenSmsVerification';
import AsyncStorage from '@react-native-community/async-storage';
import OrderSummaryScreen from './screen/ScreenOrderSummary';
// import { createAppContainer } from 'react-navigation';
// import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icon from "react-native-vector-icons/Ionicons";
import Icon from 'react-native-vector-icons/FontAwesome';
import getLanguage from './resource/LanguageSupport';

// import Ionicons from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const LandingStack = createStackNavigator();
let langObj = getLanguage();

function LandingStackScreen(){
  return (
    <LandingStack.Navigator screenOptions={{headerShown: false}}>
      <LandingStack.Screen name={LandingScreenName} component={LandingScreen} />
      <LandingStack.Screen name={PhoneInputScreenName} component={PhoneInputScreen} />
      <LandingStack.Screen name={SmsVerificationScreenName} component={SmsVerificationScreen} />
      <LandingStack.Screen name={HomeScreenName} component={HomeScreen} />
      <LandingStack.Screen name={PhoneRegistrationScreenName} component={PhoneRegistrationScreen} />
    </LandingStack.Navigator>
  );
}

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <HomeStack.Screen name={HomeScreenName} component={HomeScreen} />
      <HomeStack.Screen name={LandingScreenName} component={LandingStackScreen} />
      <HomeStack.Screen name={ProductDetailScreenName} component={ProductDetailScreen} />
      <HomeStack.Screen name={SearchResultScreenName} component={SearchResultScreen} />
      <HomeStack.Screen name={UserScreenName} component={CustomDrawerSideMenu} />
      <HomeStack.Screen name={OrderSummaryScreenName} component={OrderSummaryScreen} />
    </HomeStack.Navigator>
  );
}



console.disableYellowBox = true;

function RootApp() {
  if (isForceRTL) {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() =>
        (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
      }
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;
        if (previousRouteName !== currentRouteName) {
          // The line below uses the expo-firebase-analytics tracker
          // https://docs.expo.io/versions/latest/sdk/firebase-analytics/
          // Change this line to use another Mobile analytics SDK
        }
        // Save the current route name for later comparision
        routeNameRef.current = currentRouteName;
        try {
          AsyncStorage.setItem(key_current_route_name, currentRouteName);

        } catch (e) {}
      }}>
      <Tab.Navigator
        initialRouteName={SplashScreenName}
        screenOptions={{
          headerShown: false,
          cardOverlayEnabled: false,
        }}
        tabBarOptions={{
          inactiveTintColor: '#000000',
          activeTintColor: '#ffbb05',
          activeBackground: '#ffbb05',
        }}
      >
        <Tab.Screen name={SplashScreenName} component={SplashScreen} options={{tabBarVisible: false, tabBarLabel: ''}}/>
        <Tab.Screen 
          name={HomeScreenName} 
          component={HomeStackScreen} 
          options={({route})=>({
            tabBarLabel: langObj.home,
            tabBarIcon: ({focused})=>{
              if(route.name==='HomeScreenName'){
                if(focused)
                  return <Image style={{height:20, width:20}} source={require('./image/dibble_active.png')}/>
                else
                  return <Image style={{height:20, width:20}} source={require('./image/dibble.png')}/>

              }
            },
          })}
        />
        <Tab.Screen 
          name={CategoryScreenName} 
          component={CategoryScreen} 
          options={({route})=>({
            tabBarLabel: langObj.category,
            tabBarIcon: ({focused})=>{
              if(route.name==='CategoryScreenName'){
                if(focused)
                  return <Image style={{height:20, width:20}} source={require('./image/category_active.png')}/>
                else
                  return <Image style={{height:20, width:20}} source={require('./image/category.png')}/>

              }
            },
          })}
        />
        <Tab.Screen 
          name={ProductDetailScreenName} 
          component={ProductDetailScreen} 
          options={({route})=>({
            tabBarLabel: langObj.cart,
            tabBarIcon: ({focused})=>{
              if(route.name==='ProductDetailScreenName'){
                if(focused)
                  return <Image style={{height:20, width:20}} source={require('./image/cart_active.png')}/>
                else
                  return <Image style={{height:20, width:20}} source={require('./image/cart.png')}/>

              }
            },
          })}
        />
        <Tab.Screen 
          name={UserScreenName} 
          component={CustomDrawerSideMenu} 
          options={({route})=>({
            tabBarLabel: langObj.user,
            tabBarIcon: ({focused})=>{
              if(route.name==='UserScreenName'){
                if(focused)
                  return <Image style={{height:20, width:20}} source={require('./image/user_active.png')}/>
                else
                  return <Image style={{height:20, width:20}} source={require('./image/user.png')}/>

              }
            },
          })}
        />
      </Tab.Navigator>
      
      {/* <Drawer.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={SplashScreenName}
        drawerContent={(props) => <CustomDrawerSideMenu {...props} />}>
        <Drawer.Screen name={HomeScreenName} component={HomeScreen} />
        <Drawer.Screen
          name={SplashScreenName}
          component={SplashScreen}
          // unmountOnBlur={true}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen name={LandingScreenName} component={LandingScreen} />
        <Drawer.Screen
          name={PhoneInputScreenName}
          component={PhoneInputScreen}
        />
        <Drawer.Screen
          name={SmsVerificationScreenName}
          component={SmsVerificationScreen}
        />
        <Drawer.Screen
          name={PhoneRegistrationScreenName}
          component={PhoneRegistrationScreen}
        />
        <Drawer.Screen name={CategoryScreenName} component={CategoryScreen} />
        <Drawer.Screen
          name={SearchResultScreenName}
          component={SearchResultScreen}
        />
        <Drawer.Screen
          name={ProductDetailScreenName}
          component={ProductDetailScreen}
        />
        <Drawer.Screen
          name={OrderSummaryScreenName}
          component={OrderSummaryScreen}
        />
      </Drawer.Navigator> */}

      
    </NavigationContainer>
  );
}
export default RootApp;
AppRegistry.registerComponent(appName, () => RootApp);
