import { createSignal, onMount, onCleanup, For, createEffect } from 'solid-js';
import { useScroll } from 'solidjs-use';
import { clsx } from 'clsx';
import { pusherClient } from '@/server/pusherClient';
import { toPusherKey } from '@/utils';
import ChatBubble from './ChatBubble';
import { EventName } from '@/utils/constants';

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}
const MESSAGES_SIZE = 20;

const Messages = (props: MessagesProps) => {
  const messageQueue = [...props.initialMessages];
  const [scrollEl, setScrollEl] = createSignal<HTMLElement>();
  const { arrivedState, setY } = useScroll(scrollEl, {
    offset: { bottom: 100 },
  });

  const shiftMessageQueue = () => {
    return messageQueue.splice(0, MESSAGES_SIZE);
  };

  const [messages, setMessages] = createSignal<Message[]>([]);

  createEffect(() => {
    if (arrivedState.top) {
      if (messageQueue?.length) {
        setMessages((prev) => [...prev, ...shiftMessageQueue()]);
      }
    }
  });

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

    const scrollToBottom = () => {
      setY(scrollEl().scrollHeight);
    };

    pusherClient.bind('incoming-message', messageHandler);
    pusherClient.bind('delete-message', delMessageHandler);
    window.addEventListener(EventName.SCROLL_TO_BOTTOM, scrollToBottom);

    onCleanup(() => {
      pusherClient.unsubscribe(toPusherKey(`chat:${props.chatId}`));
      pusherClient.unbind('incoming-message', messageHandler);
      window.removeEventListener(EventName.SCROLL_TO_BOTTOM, scrollToBottom);
    });
  });

  return (
    <div
      ref={setScrollEl}
      id="messages"
      class="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2"
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
