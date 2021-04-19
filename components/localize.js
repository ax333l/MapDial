import React from "react";
import * as RNLocalize from "expo-localization";
import i18n from "i18n-js";
import memoize from "lodash.memoize"; // Use for caching/memoize for better performance

import {
  I18nManager,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const translationGetters = {
    // lazy requires (metro bundler does not support symlinks)
    'ru-RU': () => require("./src/translations/ru.json"),
    en: () => require("./src/translations/en.json")
  };
  
export const translate = memoize(
(key, config) => i18n.t(key, config),
(key, config) => (config ? key + JSON.stringify(config) : key)
);

export const setI18nConfig = () => {
// fallback if no available language fits
const fallback = {languageTag: "en", isRTL: false};

let languageTag = RNLocalize.locale
let isRTL = RNLocalize.isRTL 
if(!translationGetters[languageTag]){languageTag = "en", isRTL = false}



// clear translation cache
translate.cache.clear();
// update layout direction
I18nManager.forceRTL(isRTL);
// set i18n-js config
i18n.translations = { [languageTag]: translationGetters[languageTag]() };
i18n.locale = languageTag;
};
