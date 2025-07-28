'use client';

import { createContext, useContext } from 'react';

// Create the CometChat context
export const CometChatContext = createContext();

// Provider component
export const CometChatProvider = ({ children }) => {
  const cometChatValue = {
    // Add any shared CometChat-related logic or state here
  };

  return (
    <CometChatContext.Provider value={cometChatValue}>
      {children}
    </CometChatContext.Provider>
  );
};

// Custom hook to access the context
export const useCometChat = () => useContext(CometChatContext);