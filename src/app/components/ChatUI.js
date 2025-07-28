'use client';

import { useEffect, useRef } from 'react';
import { CometChat } from '@cometchat-pro/chat';
import { CometChatUIKit } from '@cometchat/chat-uikit-react';

export default function ChatUI({ uid }) {
  const chatRef = useRef(null);
  const appID = '2784566d233de2b1'; // Replace with your actual app ID
  const region = 'eu'; // Must be lowercase and match your CometChat dashboard

  useEffect(() => {
    const initChat = async () => {
      try {
        // 1. Fetch authKey from backend API
        const response = await fetch('/api/comet_key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid }),
        });

        const result = await response.json();
        const authKey = result.authKey;

        if (!result.success || !authKey) {
          throw new Error(result.error || 'Auth key missing from response');
        }

        // 2. Initialize CometChat SDK
        const appSettings = new CometChat.AppSettingsBuilder()
          .setRegion(region)
          .subscribePresenceForAllUsers()
          .build();

        await CometChat.init(appID, appSettings);

        // 3. Login user with authKey
        await CometChat.login(uid, authKey);

        // 4. Mount CometChat UIKit widget
        const chatWidget = new CometChatUIKit();
        chatWidget.mount(chatRef.current);
      } catch (error) {
        console.error('CometChat initialization failed:', error);
      }
    };

    initChat();
  }, [uid]);

  return <div ref={chatRef} style={{ height: '100vh', width: '100%' }} />;
}