'use client'

import dynamic from "next/dynamic";
import { useEffect } from "react";

const CometChatNoSSR = dynamic(
    () => import('../CometChatNoSSR'),
    { ssr: false }
);

function Chat() {

    useEffect(() => {
        window.CometChat = require('@cometchat-pro/chat').CometChat
    });

    return (
        <div><CometChatNoSSR /></div>
    )
}

export default Chat;
