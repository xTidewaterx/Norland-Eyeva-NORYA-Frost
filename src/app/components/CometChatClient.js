'use client';

import React, { useEffect, useState } from 'react';
import CometChatApp from '../CometChat/CometChatApp';
import { CometChatProvider } from '../context/CometChatContext';

const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;
const APP_ID = '2784566d233de2b1';
const REGION = 'EU';

const CometChatClient = () => {
  const [isReady, setIsReady] = useState(false);

useEffect(() => {
  import('@cometchat/chat-uikit-react').then((sdk) => {
    const CometChatUIKit = sdk?.CometChatUIKit;
    const UIKitSettingsBuilder = sdk?.UIKitSettingsBuilder;

    if (typeof CometChatUIKit !== 'object' || typeof UIKitSettingsBuilder !== 'function') {
      console.error('❌ SDK exports not loaded correctly:', sdk);
      return;
    }

    const APP_ID = '2784566d233de2b1';
    const REGION = 'EU';
    const AUTH_KEY = process.env.NEXT_PUBLIC_AUTH_KEY;

    const uiKitSettings = new UIKitSettingsBuilder()
      .setAppId(APP_ID)
      .setRegion(REGION)
      .setAuthKey(AUTH_KEY)
      .subscribePresenceForAllUsers()
      .build();

    if (!uiKitSettings || typeof uiKitSettings !== 'object') {
      console.error('❌ uiKitSettings not built correctly:', uiKitSettings);
      return;
    }

    CometChatUIKit.init(uiKitSettings)
      .then(() => {
        console.log('✅ CometChat initialized');
        // You can now proceed with login or rendering
      })
      .catch((err) => console.error('❌ Init failed:', err));
  }).catch((err) => {
    console.error('❌ Failed to load CometChat SDK', err);
  });
}, []);

  return isReady ? (
    <CometChatProvider>
      <CometChatApp />
    </CometChatProvider>
  ) : (
    <p>Loading chat...</p>
  );
};

export default CometChatClient;