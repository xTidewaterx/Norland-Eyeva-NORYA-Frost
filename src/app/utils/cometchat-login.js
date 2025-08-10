'use client'


import { CometChat } from "@cometchat/chat-sdk-javascript";

const AUTH_KEY = process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY;

/**
 * Logs in a user with their UID. You must create this user first via dashboard or API.
 */
export async function loginCometChatUser(uid= "cometchat-uid-1") {
  try {
    const user = await CometChat.login(uid, AUTH_KEY);
    console.log("✅ Logged in:", user);
    return user;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
}