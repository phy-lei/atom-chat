import { createSignal, onMount, onCleanup, Show, For } from 'solid-js';
import toast from 'solid-toast';
import { pusherClient } from '@/server/pusherClient';
import { toPusherKey, chatHrefConstructor } from '@/utils';
import UnseenChatToast from './UnseenChatToast';
import $message from '@/components/$message';

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
  aiPage?: boolean;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const ownerEmail = import.meta.env.PUBLIC_OWNER_EMAIL;

const SidebarChatList = (props: SidebarChatListProps) => {
  const [unseenMessages, setUnseenMessages] = createSignal<
    Record<string, Message[]>
  >({});

  const [activeChats, setActiveChats] = createSignal<User[]>(
    props.friends.sort()
  );

  const [activeAiPage, setActiveAiPage] = createSignal(false);

  onMount(() => {
    pusherClient.subscribe(toPusherKey(`user:${props.sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${props.sessionId}:friends`));

    const newFriendHandler = (newFriend: User) => {
      setActiveChats((prev) => [...prev, newFriend]);
      if (newFriend.email === ownerEmail) {
        setActiveAiPage(true);
      }
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        window.location.pathname !==
        `/dashboard/chat/${chatHrefConstructor(
          props.sessionId,
          message.senderId
        )}`;

      if (!shouldNotify) return;

      // should be notified
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={props.sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ));
      setUnseenMessages((prev) => {
        const prevArr = prev[message.senderId] ?? [];
        return {
          ...prev,
          [message['senderId']]: [...prevArr, message],
        };
      });
    };

    const transitionChange = () => {
      if (window.location.pathname.includes('chat')) {
        setUnseenMessages((prev) => {
          const keysArr = Object.keys(prev).filter(
            (key) => !window.location.pathname.includes(key)
          );

          return keysArr.reduce((acc, id) => {
            return { ...acc, [id]: prev[id] };
          }, {});
        });
      }
    };

    pusherClient.bind('new_message', chatHandler);
    pusherClient.bind('new_friend', newFriendHandler);
    // viewTransition change event
    document.addEventListener('astro:after-swap', transitionChange);

    onCleanup(() => {
      pusherClient.unsubscribe(toPusherKey(`user:${props.sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${props.sessionId}:friends`));

      pusherClient.unbind('new_message', chatHandler);
      pusherClient.unbind('new_friend', newFriendHandler);
      document.removeEventListener('astro:after-swap', transitionChange);
    });
  });

  const handleDel = (friend: User, index: number) => {
    $message({ text: 'Are you sure to delete your friend?' }).then(() => {
      confirm(friend, index);
    });
  };

  const confirm = async (friend: User, index: number) => {
    const res = await fetch('/api/friends/delete', {
      method: 'POST',
      body: JSON.stringify({
        targetId: friend.id,
      }),
    });
    if (!res.ok) {
      toast.error('Something went wrong. Please try again later.');
    } else {
      const chatArr = [...activeChats()];
      chatArr.splice(index, 1);
      setActiveChats(chatArr);
      if (window.location.pathname.includes(friend.id)) {
        window.location.href = window.location.origin;
      }
    }
  };

  return (
    <ul role="list" class="max-h-[25rem] -mx-2 space-y-1 overflow-y-auto">
      <Show when={props.aiPage || activeAiPage()} fallback={null}>
        <li>
          <a
            href={`/dashboard/ai`}
            class="color-#FF7E33 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
          >
            Rayone🤖️
          </a>
        </li>
      </Show>

      <For each={activeChats()}>
        {(friend, index) => {
          return (
            <li class="flex items-center justify-between hover:bg-gray-50 group relative">
              <a
                href={`/dashboard/chat/${chatHrefConstructor(
                  props.sessionId,
                  friend.id
                )}`}
                class="text-gray-700 group-hover:text-indigo-600  flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                rel="prefetch"
              >
                {friend.name}
                <Show
                  when={unseenMessages()[friend.id]?.length > 0}
                  fallback={null}
                >
                  <div class="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                    {unseenMessages()[friend.id].length}
                  </div>
                </Show>
              </a>
              <i
                class="i-carbon:trash-can cursor-pointer invisible group-hover:visible"
                onClick={() => handleDel(friend, index())}
              ></i>
            </li>
          );
        }}
      </For>
    </ul>
  );
};

export default SidebarChatList;
