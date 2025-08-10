import { CometChat } from "@cometchat/chat-sdk-javascript";

const COMETCHAT_CONSTANTS = {
  APP_ID: "2784566d233de2b1",
  REGION: "EU",
  AUTH_KEY: process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY,
};

export function initializeCometChat() {
  if (typeof window === "undefined") return; // ⛑️ prevent server crash

  const appSettings = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .build();

  CometChat.init(COMETCHAT_CONSTANTS.APP_ID, appSettings)
    .then(() => console.log("✅ CometChat SDK initialized"))
    .catch((err) => console.error("❌ CometChat init failed", err));
}