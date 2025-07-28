'use client';

console.log("Auth Key:", authKey);
import React, { useEffect } from 'react';
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from '@cometchat/chat-uikit-react';
import CometChatApp from '../..//CometChat/CometChatApp';
import { CometChatProvider } from '../../context/CometChatContext';
import { setupLocalization } from '../../context/utils';

const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;

export const COMETCHAT_CONSTANTS = {
  APP_ID: '2784566d233de2b1', // Replace with your App ID
  REGION: 'EU',              // Replace with your Region
  AUTH_KEY: authKey,         // Auth Key from .env file
};

console.log("Auth Key:", authKey);

const CometChatNoSSR = () => {
  useEffect(() => {
    const UIKitSettings = new UIKitSettingsBuilder()
      .setAppId(COMETCHAT_CONSTANTS.APP_ID)
      .setRegion(COMETCHAT_CONSTANTS.REGION)
      .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
      .subscribePresenceForAllUsers()
      .build();

    CometChatUIKit.init(UIKitSettings)
      ?.then(() => {
        setupLocalization();
        console.log('CometChat initialized successfully');
      })
      .catch((error) =>
        console.error('CometChat initialization failed', error)
      );
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <CometChatProvider>
        <CometChatApp />
      </CometChatProvider>
    </div>
  );
};

export default CometChatNoSSR;
