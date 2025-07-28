// src/context/utils.js

"use client"; // For Next.js App Router

export const setupLocalization = () => {
  // Example: Set default language or override strings
  if (typeof window !== "undefined" && window.CometChatLocalize) {
    window.CometChatLocalize.init("en", {
      en: {
        CHATS: "Chats",
        CALLS: "Calls",
        USERS: "Users",
      },
    });
  } else {
    console.warn("CometChatLocalize is not available.");
  }
};