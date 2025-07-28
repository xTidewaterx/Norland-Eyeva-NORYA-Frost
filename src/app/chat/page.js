import dynamic from 'next/dynamic';

const CometChatNoSSR = dynamic(() => import('../components/CometChatNoSSR'), {
  ssr: false
});

export default function ChatPage() {
  return <CometChatNoSSR />;
}