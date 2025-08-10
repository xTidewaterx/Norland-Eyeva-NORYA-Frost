



import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

/**
 * CometChat Constants - Replace with your actual credentials
 */
const COMETCHAT_CONSTANTS = {
  APP_ID: "2784566d233de2b1",
  REGION: "EU",
  AUTH_KEY:  process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY,
};
/**
 * Configure the CometChat UI Kit using the UIKitSettingsBuilder.
 * This setup determines how the chat UI behaves.
 */
const UIKitSettings = new UIKitSettingsBuilder()
  .setAppId(COMETCHAT_CONSTANTS.APP_ID) // Assign the App ID
  .setRegion(COMETCHAT_CONSTANTS.REGION) // Assign the App's Region
  .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY) // Assign the Authentication Key (if applicable)
  .subscribePresenceForAllUsers() // Enable real-time presence updates for all users
  .build(); // Build the final configuration

/**
 * Initialize the CometChat UI Kit with the configured settings.
 * Once initialized successfully, you can proceed with user authentication and chat features.
 */
CometChatUIKit.init(UIKitSettings)
  .then(() => {
    console.log("CometChat UI Kit initialized successfully.");
    // You can now call login function to authenticate users
  })
  .catch((error) => {
    console.error("CometChat UI Kit initialization failed:", error); // Log errors if initialization fails
  });