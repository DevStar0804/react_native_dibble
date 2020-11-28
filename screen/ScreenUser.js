/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { LandingScreenName, UserScreenName, key_user_info } from '../resource/BaseValue';

export default class UserScreen extends React.Component {
  constructor (props) {
    super(props);
    this.state = ({

    });
  }
  componentWillMount() {
    this.checkTokenForMenu();    
  }
  checkTokenForMenu = async  () => {
    // this.props.navigation.navigate(UserScreenName);
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
          console.log('no');
          this.landing();
				} else {
          console.log('yes'); 
          this.user();
				}
			} else {

			}
		} catch(e) {
			// error reading value

		}
	}
  
  landing() {
    this.props.navigation.navigate(LandingScreenName);
  }
  user() {
    this.props.navigation.navigate(UserScreenName);
  }
  render() {
    return (
      <></>
    );
  }
}