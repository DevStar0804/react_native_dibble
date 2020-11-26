import {StyleSheet, I18nManager} from 'react-native';
import {isForceRTL} from '../BaseValue';

export const globalStyle = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textBasicStyle: {
    fontFamily: 'HelveticaNeue',
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textBasicBoldStyle: {
    fontFamily: 'HelveticaNeue-Bold',
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textHeader: {
    fontFamily: 'HelveticaNeue',
    fontSize: 13,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textSearch: {
    fontFamily: 'HelveticaNeue',
    fontSize: 14,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textItemName: {
    fontFamily: 'HelveticaNeue',
    fontSize: 11,
    fontWeight: 'bold',
    margin: 5,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textItemDescription: {
    fontFamily: 'HelveticaNeue',
    fontSize: 11,
    margin: 5,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
});
