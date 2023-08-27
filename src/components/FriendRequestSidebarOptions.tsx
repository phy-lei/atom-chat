import { createSignal, onMount } from 'solid-js';
import { pusherClient } from '@/server/pusher';
import { toPusherKey } from '@/utils';

interface FriendRequestSidebarOptionsProps {
  sessionId: string;
  initialUnseenRequestCount: number;
}

const FriendRequestSidebarOptions = (
  props: FriendRequestSidebarOptionsProps
) => {
  const [unseenRequestCount, setUnseenRequestCount] = createSignal<number>(
    props.initialUnseenRequestCount
  );

  onMount(() => {
    console.log(
      '%c [ xxx ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      123123
    );
    pusherClient.subscribe(
      toPusherKey(`user:${props.sessionId}:incoming_friend_requests`)
    );
    pusherClient.subscribe(toPusherKey(`user:${props.sessionId}:friends`));

    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };

    const addedFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1);
    };

    pusherClient.bind('incoming_friend_requests', friendRequestHandler);
    pusherClient.bind('new_friend', addedFriendHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${props.sessionId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(toPusherKey(`user:${props.sessionId}:friends`));

      pusherClient.unbind('new_friend', addedFriendHandler);
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
    };
  });

  return (
    <a
      href="/dashboard/requests"
      class="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div class="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <div class="i-ion:person-sharp h-4 w-4" />
      </div>
      <p class="truncate">Friend requests</p>

      {unseenRequestCount() > 0 ? (
        <div class="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenRequestCount()}
        </div>
      ) : null}
    </a>
  );
};

export default FriendRequestSidebarOptions;
