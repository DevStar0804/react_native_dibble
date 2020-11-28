/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, TextInput, Dimensions, TouchableOpacity, Image
} from 'react-native';
import {c_dark_line, isForceRTL, SearchResultScreenName,} from '../../resource/BaseValue';
import getLanguage from '../../resource/LanguageSupport';
import {globalStyle} from '../../resource/style/GlobalStyle';
import {searchTextPadding} from '../../resource/staus_bar_height';

export default class SearchInput extends React.Component {
  constructor(props) {
      super(props);
      this.state = ({
          searchText:"",
          selection: {
            start: 0,
            end: 0
          }
      });
  }
  componentDidMount() {
  }

  render() {
    const { wantToBuy, navigation, style, ...props } = this.props;
    let close_button;
		if(this.state.searchText != ''){
			close_button = <Image
					source={require("../../image/icon_close_black.png")}
					resizeMode="contain"
					style={{
							width:screenWidth*0.03,
							height:screenWidth*0.03}}
			/>;
		}
    const { selection } = this.state;
    return (
      <View style={style}>
        <TouchableOpacity
          onPress={()=>{
            if(this.state.searchText != '')
              navigation.navigate(SearchResultScreenName, {
                searchText: this.state.searchText
              })
          }}>
          <Image
            source={require("../../image/icon_search.png")}
            resizeMode="contain"
            style={{
              width:screenWidth*0.05,
              height:screenWidth*0.05*(153/150),marginEnd:5}}
          />
        </TouchableOpacity>
        <TextInput
          placeholder={wantToBuy}
          textAlign= { isForceRTL? 'right':'left'}
          style={[globalStyle.textSearch,{ flex:1, margin:0,padding:searchTextPadding}]}
          value={this.state.searchText}
          onSubmitEditing={()=>{
            if(this.state.searchText != '')
              this.props.navigation.navigate(SearchResultScreenName, {
                searchText: this.state.searchText
              })
          }}
          onChangeText={(text)=>{
            this.setState({searchText: text})
          }}
          onKeyPress={({ nativeEvent }) => {
            if (isForceRTL && nativeEvent.key === 'Backspace') {
              this.setState({searchText: this.state.searchText.substr(1)})
            }
          }}
          selection={ isForceRTL? selection : null } 
        />
        <TouchableOpacity
            onPress={()=>{
              this.setState({searchText: ''});
            }}>
            {close_button}
        </TouchableOpacity>
      </View>
    );
  }
}

const screenWidth = Math.round(Dimensions.get('window').width);
