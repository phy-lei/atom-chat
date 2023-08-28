import { createSignal, onMount, onCleanup, Show, For } from 'solid-js';
import { pusherClient } from '@/server/pusherClient';
import { toPusherKey } from '@/utils';

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests = (props: FriendRequestsProps) => {
  const [friendRequests, setFriendRequests] = createSignal<
    IncomingFriendRequest[]
  >(props.incomingFriendRequests);

  onMount(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${props.sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    };

    pusherClient.bind('incoming_friend_requests', friendRequestHandler);

    onCleanup(() => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${props.sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
    });
  });

  const requestApi = async (action: 'accept' | 'deny', senderId: string) => {
    const res = await fetch(`/api/friends/${action}`, {
      method: 'POST',
      body: JSON.stringify({
        id: senderId,
      }),
    });

    if (res.ok) {
      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );
      window.location.reload();
    }
  };

  const acceptFriend = async (senderId: string) => {
    requestApi('accept', senderId);
  };

  const denyFriend = async (senderId: string) => {
    requestApi('deny', senderId);
  };

  return (
    <>
      <Show
        when={friendRequests().length !== 0}
        fallback={<p class="text-sm text-zinc-500">Nothing to show here...</p>}
      >
        <For each={friendRequests()}>
          {(request) => (
            <div class="flex gap-4 items-center">
              <div class="i-carbon:user-follow h-4 w-4 text-black" />
              <p class="font-medium text-lg">{request.senderEmail}</p>
              <button
                onClick={() => acceptFriend(request.senderId)}
                aria-label="accept friend"
                class="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <div class="i-carbon:checkmark font-semibold text-white w-3/4 h-3/4" />
              </button>

              <button
                onClick={() => denyFriend(request.senderId)}
                aria-label="deny friend"
                class="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <div class="i-carbon:close font-semibold text-white w-3/4 h-3/4" />
              </button>
            </div>
          )}
        </For>
      </Show>
    </>
  );
};

export default FriendRequests;
