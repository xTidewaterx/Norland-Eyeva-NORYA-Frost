"use client";

import React from "react";
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";

const authKeyValue = process.env.NEXT_PUBLIC_AUTH_KEY;


const CometChatApp = () => {


  const appId = "2784566d233de2b1";     // replace with your App ID
  const region = "EU";    // replace with your Region
  const authKey = authKeyValue; // replace with your Auth Key

  const UIKitSettings = new UIKitSettingsBuilder()
    .setAppId(appId)
    .setRegion(region)
    .setAuthKey(authKey)
    .build();

  return <CometChatUIKit settings={UIKitSettings} />;
};

export default CometChatApp;