we must add a free for production use app::

https://www.youtube.com/watch?v=0mmX_3Ohnz8

https://www.youtube.com/watch?v=0mmX_3Ohnz8

v6 docs::
https://www.cometchat.com/docs/ui-kit/react/builder-integration-nextjs


1:: important:: go cometchat dashboard, then integrate, next.js, launch visual builder, after building ui, enable the features in cometchat dashboard chats that you need

2:: then download code, extract downloaded file, then inside of cometchat visual builder react, choose src file, choose cometchat folder

3:: copy that comet chat folder from step 2 (comet chatg folder) into your react root folder, root is the folder that contains the entire project, where it begins

4:: replace main.tsx file with the one in the documentation, for next.js perhaps differeent?

5:: then paste actual app id intel into main.tsx ::

const COMETCHAT_CONSTANTS = {
  APP_ID: "2784566d233de2b1",
  REGION: "EU",
  AUTH_KEY: process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY,
};

5.1>:: use sample id to log user in, like const UID ="sample uid";

6:: finally we must create our cometchat nossr file server side rendering out, have comet chat only on client side

then in our component cometchatappwrapper we have our cometchatcomponent, then we have our home::


Now, import and use the wrapper component in your project’s main entry file.

import CometChatAppWrapper from "./CometChatAppWrapper";

export default function Home() {
  return (
    <>
      {/* Other components or content */}
      <CometChatAppWrapper />
    </>
  );
}


7:: 


we will use cometchat::

Great question, Johan! In CometChat, 100 Monthly Active Users (MAUs) means up to 100 unique users who send or receive messages, join groups, or interact with the chat system during a given month.
🧠 What Counts as “Active”?
- Logging in and sending at least one message
- Receiving messages or notifications
- Joining or participating in a group chat
- Making a voice or video call
- Any meaningful interaction tracked by CometChat’s analytics
So if your hiking marketplace has 300 registered users, but only 95 of them actually chat or interact in a given month, you’re still within the free tier. Once you hit 101 active users in a month, CometChat will prompt you to upgrade or pay for overages.
Want help estimating how quickly your user base might grow or how to keep MAUs under control while scaling? I can help you plan it like a trail map 🥾📈.

















rethink this, make sure you have a generous free tier, and that it is super easy to implement, add a listener on the events towards the database