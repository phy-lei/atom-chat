import { createSignal, onMount, onCleanup, For } from 'solid-js';
import { clsx } from 'clsx';
import { pusherClient } from '@/server/pusherClient';
import { toPusherKey } from '@/utils';
import ChatBubble from './ChatBubble';

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}

const Messages = (props: MessagesProps) => {
  const [messages, setMessages] = createSignal<Message[]>(
    props.initialMessages
  );

  onMount(() => {
    pusherClient.subscribe(toPusherKey(`chat:${props.chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    const delMessageHandler = (delData: Record<string, number>) => {
      const { messageNum, index } = delData;

      setMessages((prev) => {
        const tempArr = [...prev];
        tempArr.splice(index, messageNum);
        return tempArr;
      });
    };

    pusherClient.bind('incoming-message', messageHandler);
    pusherClient.bind('delete-message', delMessageHandler);

    onCleanup(() => {
      pusherClient.unsubscribe(toPusherKey(`chat:${props.chatId}`));
      pusherClient.unbind('incoming-message', messageHandler);
    });
  });

  let scrollDownRef;

  return (
    <div
      ref={scrollDownRef}
      id="messages"
      class="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <For each={messages()}>
        {(message, index) => {
          const isCurrentUser = message.senderId === props.sessionId;
          const hasNextMessageFromSameUser =
            messages()[index() - 1]?.senderId === message.senderId;
          return (
            <div class="chat-message">
              <div
                class={clsx('flex items-end', {
                  'justify-end': isCurrentUser,
                })}
              >
                <ChatBubble
                  isCurrentUser={isCurrentUser}
                  message={message}
                  index={index()}
                  chatId={props.chatId}
                  isRoundCorner={hasNextMessageFromSameUser}
                />
                <div
                  class={clsx('relative w-6 h-6', {
                    'order-2': isCurrentUser,
                    'order-1': !isCurrentUser,
                    'invisible': hasNextMessageFromSameUser,
                  })}
                >
                  <img
                    src={
                      isCurrentUser
                        ? (props.sessionImg as string)
                        : props.chatPartner.image
                    }
                    alt="Profile picture"
                    class="rounded-full"
                  />
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
};

export default Messages;
