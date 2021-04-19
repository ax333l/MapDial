import React from 'react'
import { StyleSheet, Dimensions } from 'react-native'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

const styles = StyleSheet.create({
  relative: {
    position: 'relative',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  actionSize: {
    fontSize: 34,
    fontFamily: 'Roboto-Regular',
  },
  fs23: {
    fontSize: 23,
    fontFamily: 'Roboto-Regular',
  },
  titleSize: {
    fontSize: 21,
    fontFamily: 'Roboto-Regular',
  },
  defaultSize: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
  },
  smallSize: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
  },
  fs14: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  smallerSize: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
  },
  listSmallSize: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  boxSize: {
    fontSize: 28,
    fontFamily: 'Roboto-Regular',
  },
  defaultTextColor: {
    color: 'rgba(68, 68, 68, 1)',
  },
  whiteBg: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  lightSilver: {
    backgroundColor: 'rgba(245, 245, 245, 1)',
  },
  silverBg: {
    backgroundColor: 'rgba(219, 219, 219, 1)',
  },
  yellowBg: {
    backgroundColor: 'rgba(255, 205, 0, 1)',
  },
  mainBg: {
    backgroundColor: 'rgba(81, 175, 43, 1)',
  },
  darkGreenBg: {
    backgroundColor: 'rgba(51, 115, 25, 1)',
  },
  lightGreenBg: {
    backgroundColor: 'rgba(216, 226, 212, 1)',
  },
  redBg: {
    backgroundColor: 'rgba(244, 67, 54, 1)',
  },
  mainColorText: {
    color: 'rgba(81, 175, 43, 1)',
  },
  dateActive: {
    color: 'rgba(14,115,15,1)'
  },
  darkGreenText: {
    color: 'rgba(14, 115, 15, 1)',
  },
  yellowText: {
    color: 'rgba(255, 205, 0, 1)',
  },
  grayText: {
    color: 'rgba(161, 161, 161, 1)',
  },
  whiteText: {
    color: 'rgba(255, 255, 255, 1)',
  },
  errorText: {
    color: '#f44336',
  },
  redText: {
    color: 'rgba(244, 67, 54, 1)',
  },
  notificationText: {
    color: 'rgba(40, 40, 40, 1)',
  },
  grayBorder: {
    borderWidth: 1,
    borderColor: 'rgba(219, 219, 219, 1)',
  },
  mainBorder: {
    borderWidth: 1,
    borderColor: 'rgba(81, 175, 43, 1)',
  },
  circleGrayBorder: {
    borderWidth: 1,
    borderColor: 'rgba(161, 161, 161, 1)',
  },
  flex: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexOne: {
    flex: 1,
  },
  flexThree: {
    flex: 3,
  },
  flexTwo: {
    flex: 2,
  },
  alignItemsStart: {
    alignItems: 'flex-start',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  alignItemsEnd: {
    alignItems: 'flex-end',
  },
  justifyContentStart: {
    justifyContent: 'flex-start',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  justifyContentEnd: {
    justifyContent: 'flex-end',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  normal: {
    fontFamily: 'Roboto-Regular',
  },
  zIndex1: {
    zIndex: 1,
  },
  zIndex2: {
    zIndex: 2,
  },
  Radius4: {
    borderRadius: 4,
  },
  pad20: {
    padding: 20,
  },
  pad15: {
    padding: 15,
  },
  paddingHorizontal20: {
    paddingHorizontal: 20,
  },
  paddingVertical50: {
    paddingVertical: 50,
  },
  paddingVertical30: {
    paddingVertical: 30,
  },
  paddingVertical20: {
    paddingVertical: 20,
  },
  paddingVertical15: {
    paddingVertical: 15,
  },
  paddingVertical10: {
    paddingVertical: 10,
  },
  pt30: {
    paddingTop: 30,
  },
  pl20: {
    paddingLeft: 20,
  },
  pl15: {
    paddingLeft: 15,
  },
  pl10: {
    paddingLeft: 10,
  },
  pr20: {
    paddingRight: 20,
  },
  pr15: {
    paddingRight: 15,
  },
  pr10: {
    paddingRight: 10,
  },
  marginHorizontal20: {
    marginHorizontal: 20,
  },
  marginHorizontalMinus10: {
    marginHorizontal: -10,
  },
  mt30: {
    marginTop: 30,
  },
  mt25: {
    marginTop: 25,
  },
  mt20: {
    marginTop: 20,
  },
  mt15: {
    marginTop: 15,
  },
  mt10: {
    marginTop: 10,
  },
  mt5: {
    marginTop: 5,
  },
  ml20: {
    marginLeft: 20,
  },
  ml15: {
    marginLeft: 15,
  },
  mr20: {
    marginRight: 20,
  },
  mr15: {
    marginRight: 15,
  },
  mr25: {
    marginRight: 25,
  },
  mr10: {
    marginRight: 10,
  },
  mr5: {
    marginRight: 5,
  },
  mb5: {
    marginBottom: 5,
  },
  mb10: {
    marginBottom: 10,
  },
  mb15: {
    marginBottom: 15,
  },
  mb20: {
    marginBottom: 20,
  },
  mb25: {
    marginBottom: 25,
  },
  mb30: {
    marginBottom: 30,
  },
  ml10: {
    marginLeft: 10,
  },
  ml5: {
    marginLeft: 5,
  },
  h60: {
    height: 60,
  },
  h165: {
    height: 165,
  },
  w70: {
    width: 70,
  },
  w100: {
    width: 100,
  },
  w120: {
    width: 120,
  },
  topRightRadiusNone: {
    borderTopRightRadius: 0,
  },
  topRightRadiusFour: {
    borderTopRightRadius: 4,
  },
  bottomRightRadiusNone: {
    borderBottomRightRadius: 0,
  },
  bottomRightRadiusFour: {
    borderBottomRightRadius: 4,
  },
  borderLeftWidthNone: {
    borderLeftWidth: 0,
  },
  title: {
    fontSize: 21,
    fontFamily: 'Roboto-Regular',
    color: 'rgba(40, 40, 40, 1)',
  },
  line: {
    height: 1,
    backgroundColor: 'rgba(161, 161, 161, 1)',
  },
  lineSilver: {
    height: 1,
    backgroundColor: 'rgba(219, 219, 219, 1)',
  },
  lineAction: {
    height: 1,
    backgroundColor: 'rgba(219, 219, 219, 1)',
    marginHorizontal: -20,
  },
  formHeader: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    lineHeight: 30,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    borderTopWidth: 1,
    borderTopColor: 'rgba(219, 219, 219, 1)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(219, 219, 219, 1)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(219, 219, 219, 1)',
    top: 1,
    zIndex: 2,
  },
  borderBottom: {
    borderBottomColor: 'rgba(232, 232, 232, 1)',
    borderBottomWidth: 1.2,
  },
  formLine: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(219, 219, 219, 1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(219, 219, 219, 1)',
    zIndex: 1,
  },
  formGroupButton: {
    borderRadius: 4,
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    lineHeight: 60,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 1)',
    flex: 1,
  },
  formGroupButtonModal: {
    borderRadius: 4,
    backgroundColor: 'rgba(14, 115, 15, 1)',
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    lineHeight: 60,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 1)',
    flex: 1,
  },
  buttonGreenBorder: {
    color: 'rgba(81, 175, 43, 1)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 1,
    borderColor: 'rgba(81, 175, 43, 1)',
  },
  formGroupButtonRed: {
    backgroundColor: 'rgba(244, 67, 54, 1)',
  },
  formGroupButtonGray: {
    backgroundColor: 'rgba(161,161,161,1)',
  },
  formGroupButtonYellow: {
    backgroundColor: 'rgba(255, 205, 0, 1)',
  },
  formGroupButtonCustom: {
    lineHeight: 26,
    paddingVertical: 12,
  },
  formGroupButtonLarger: {
    lineHeight: 72,
  },
  formGroupButtonColor: {
    color: 'rgba(124, 124, 124, 1)',
  },
  formGroupInput: {
    position: 'relative',
  },
  formGroupInputGroup: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  pin: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    lineHeight: 36,
    textAlign: 'center',
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(219, 219, 219, 1)',
    borderRadius: 4,
    paddingHorizontal: 15,
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: '#000',
  },
  noneBorderRadius: {
    borderRadius: 0
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#fef5f5',
  },
  inputErrorBorder: {
    borderWidth: 1,
    borderColor: '#f44336',
  },
  msgError: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginLeft: 5
  },
  visibilityIcon: {
    width: 30,
    height: 30
  },
  rowMsg: {
    flexDirection: 'row'
  },
  flexWrapper: {
    flexWrap: 'wrap'
  },
  w140: {
    width: 140,
  },
  shipmentTime: {
    backgroundColor: 'rgba(255, 205, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 205, 0, 1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: 'rgba(40, 40, 40, 1)',
  },
  shipmentID: {
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 187, 1)',
    backgroundColor: 'rgba(249, 249, 249, 1)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  shipmentRef: {
    paddingVertical: 4,
  },
  photoMark: {
    marginTop: -165,
  },
  photoMarkOrder: {
    width: 24,
    height: 24,
    lineHeight: 24,
    borderTopLeftRadius: 8,
  },
  photoMarkBtn: {
    width: 24,
    height: 24,
  },
  shipmentTitle: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    borderTopWidth: 1,
    borderTopColor: 'rgba(219, 219, 219, 1)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(219, 219, 219, 1)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(219, 219, 219, 1)',
    top: 1,
    left: 0,
    zIndex: 2,
  },
  shipmentForm: {
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(219, 219, 219, 1)',
  },
  circleOr: {
    width: 24,
  },
  circleOrLine: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  circleOrText: {
    position: 'absolute',
    top: 18,
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  upload: {
    width: width / 4,
    height: width / 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 124, 124, 1)',
    borderStyle: 'dashed',
  },
  uploadCircle: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(124, 124, 124, 1)',
    borderRadius: 24,
    marginBottom: 5,
  },
  uploadCircleText: {
    lineHeight: 24,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
  },
  overlayComponent: {
    width: '80%',
    backgroundColor: 'rgba(243, 244, 245, 0.9)',
    opacity: 1,
    borderWidth: 1,
    borderColor: 'rgb(139, 218, 238)',
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    height: 'auto',
    transform: [{ translateX: width / 10 }],
    padding: 10
  },
  overlayMoreinfo: {
    width: '80%',
    backgroundColor: 'rgba(243, 244, 245, 0.9)',
    opacity: 1,
    borderWidth: 1,
    borderColor: 'rgb(139, 218, 238)',
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    top: 20,
    transform: [{ translateX: width / 10 }],
    padding: 10
  },
  // Custom
  date: {
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 187, 1)',
    backgroundColor: 'rgba(249, 249, 249, 1)',
    borderRadius: 4,
    marginTop: 3,
  },
  dateText: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  boxFilter: {
    backgroundColor: 'rgba(249, 249, 249, 1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(232, 232, 232, 1)',
    paddingVertical: 15,
    paddingRight: 15,
    paddingLeft: 5,
    maxWidth: 260,
  },
  boxFilterResetPadding: {
    paddingVertical: 5,
    paddingRight: 5,
  },
  linePin: {
    width: 1,
    backgroundColor: 'rgba(219, 219, 219, 1)',
    position: 'absolute',
  },
  bookGroupButton: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 5,
  },
  rating: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgb(187, 187, 187)',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  textCapitalize: {
    textTransform: 'capitalize',
  },
  textUppercase: {
    textTransform: 'uppercase',
  }
})

export default styles