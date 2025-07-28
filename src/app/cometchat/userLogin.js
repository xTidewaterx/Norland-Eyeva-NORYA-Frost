import { CometChatUIKit } from "@cometchat/chat-uikit-react";

const UID = "cometchat-uid-1"; // Replace with your actual UID

CometChatUIKit.getLoggedinUser().then((user) => {
  if (!user) {
    // If no user is logged in, proceed with login
    CometChatUIKit.login(UID)
      .then((user) => {
        console.log("Login Successful:", { user });
        // Mount your app
      })
      .catch(console.log);
  } else {
    // If user is already logged in, mount your app
  }
});