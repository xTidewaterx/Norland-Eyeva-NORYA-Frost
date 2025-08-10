'use client';

import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatConversations } from "@cometchat/chat-uikit-react";
import "./CometChatSelector.css";

const CometChatSelector = ({ onSelectorItemClicked = () => {} }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeItem, setActiveItem] = useState(undefined);

  useEffect(() => {
    // ✅ Logs your Auth Key from environment variables
    console.log("Auth Key on refresh:", process.env.NEXT_PUBLIC_AUTH_KEY);
  }, []);

  useEffect(() => {
    // ✅ Safely fetch currently logged-in user
    CometChat.getLoggedinUser()
      .then((user) => setLoggedInUser(user))
      .catch((error) => console.error("Failed to get logged-in user:", error));
  }, []);

  return (
    <>
      {loggedInUser && (
        <CometChatConversations
          activeConversation={
            activeItem instanceof CometChat.Conversation ? activeItem : undefined
          }
          onItemClick={(item) => {
            setActiveItem(item);
            onSelectorItemClicked(item, "updateSelectedItem");
          }}
        />
      )}
    </>
  );
};

export default CometChatSelector;