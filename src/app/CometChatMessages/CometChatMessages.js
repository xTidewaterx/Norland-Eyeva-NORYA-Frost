'use client';

import React from 'react';
import {
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatMessageComposer,
} from '@cometchat/chat-uikit-react';
import './CometChatMessages.css';

const CometChatMessages = ({ item, type, onBack }) => {
  if (!item || !type) {
    console.warn('🚨 CometChatMessages received invalid props');
    return <p className="chat-placeholder">⚠️ No chat target selected.</p>;
  }

  const isValidUser = type === 'user' && item?.uid;
  const isValidGroup = type === 'group' && item?.guid && item?.hasJoined;

  if (!isValidUser && !isValidGroup) {
    console.warn('🚫 Invalid item passed to CometChatMessages:', item);
    return <p className="chat-placeholder">❌ Invalid chat target.</p>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header-row">
        <button className="chat-back-button" onClick={onBack}>
          ⬅️ Back
        </button>
      </div>

      <CometChatMessageHeader item={item} type={type} />
      <CometChatMessageList item={item} type={type} />
      <CometChatMessageComposer item={item} type={type} />
    </div>
  );
};

export default CometChatMessages;