import {
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  Show,
  For,
} from 'solid-js';
import toast from 'solid-toast';
import { pusherClient } from '@/server/pusherClient';
import { toPusherKey, chatHrefConstructor } from '@/utils';
import UnseenChatToast from './UnseenChatToast';
import $message from '@/components/$message';
import { EventName } from '@/utils/constants';

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
  const [onLineFriendsId, setOnLineFriendsId] = createSignal({});

  const [activeChats, setActiveChats] = createSignal<User[]>(
    props.friends.sort()
  );

  const [activeAiPage, setActiveAiPage] = createSignal(false);

  const getOnlineMap = async () => {
    const res = await fetch('/api/message/online', {
      method: 'POST',
      body: JSON.stringify({
        friendId: props.sessionId,
        isOnline: true,
      }),
    });
    const { data } = await res.json();
    setOnLineFriendsId(data);
  };

  createEffect(() => {
    window.dispatchEvent;
    const event = new CustomEvent(EventName.SET_ONLINE_USER_MAP, {
      detail: onLineFriendsId(),
    });
    window.dispatchEvent(event);
  });

  onMount(() => {
    const channel1 = pusherClient.subscribe(
      toPusherKey(`user:${props.sessionId}:chats`)
    );
    const channel2 = pusherClient.subscribe(
      toPusherKey(`user:${props.sessionId}:friends`)
    );
    const channel3 = pusherClient.subscribe('check__online');

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

    const checkOnlineHandler = ({ friendId, isOnline }) => {
      if (friendId === props.sessionId) return;
      setOnLineFriendsId({
        ...onLineFriendsId(),
        [friendId]: isOnline,
      });
    };

    function visibilitychange() {
      var isHidden = document.hidden;
      if (isHidden) {
        fetch('/api/message/online', {
          method: 'POST',
          body: JSON.stringify({
            friendId: props.sessionId,
            isOnline: false,
          }),
        });
      } else {
        fetch('/api/message/online', {
          method: 'POST',
          body: JSON.stringify({
            friendId: props.sessionId,
            isOnline: true,
          }),
        });
      }
    }

    channel1.bind('new_message', chatHandler);
    channel2.bind('new_friend', newFriendHandler);
    channel3.bind('new_online', checkOnlineHandler);
    // viewTransition change event
    document.addEventListener('astro:after-swap', transitionChange);

    window.addEventListener('beforeunload', (event) => {
      fetch('/api/message/online', {
        method: 'POST',
        body: JSON.stringify({
          friendId: props.sessionId,
          isOnline: false,
        }),
      });
    });
    getOnlineMap();

    document.addEventListener('visibilitychange', visibilitychange);

    onCleanup(() => {
      channel1.disconnect();
      channel2.disconnect();
      channel3.disconnect();

      channel1.unbind('new_message', chatHandler);
      channel2.unbind('new_friend', newFriendHandler);
      channel3.unbind('new_online', checkOnlineHandler);
      document.removeEventListener('astro:after-swap', transitionChange);
      document.removeEventListener('visibilitychange', visibilitychange);
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
            class="color-#FF7E33 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-1 rounded-md p-2 text-sm leading-6 font-semibold"
          >
            Rayone🤖️
            <div class="rounded-full w-1.5 h-1.5 bg-green self-baseline"></div>
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
                class="text-gray-700 group-hover:text-indigo-600  flex items-center gap-x-1 rounded-md p-2 text-sm leading-6 font-semibold"
                rel="prefetch"
              >
                {friend.name}
                <Show when={onLineFriendsId()[friend.id]} fallback={null}>
                  <div class="rounded-full w-1.5 h-1.5 bg-green self-baseline"></div>
                </Show>
                <Show when={unseenMessages()[friend.id]?.length > 0}>
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
