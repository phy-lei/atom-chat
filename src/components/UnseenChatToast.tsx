import { clsx } from 'clsx';
import { chatHrefConstructor } from '@/utils';
import toast, { type Toast } from 'solid-toast';

interface UnseenChatToastProps {
  t: Toast;
  sessionId: string;
  senderId: string;
  senderImg: string;
  senderName: string;
  senderMessage: string;
}

const UnseenChatToast = ({
  t,
  senderId,
  sessionId,
  senderImg,
  senderName,
  senderMessage,
}: UnseenChatToastProps) => {
  return (
    <div
      class={clsx(
        'max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
        { 'animate-enter': t.visible, 'animate-leave': !t.visible }
      )}
    >
      <a
        onClick={() => toast.dismiss(t.id)}
        href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`}
        class="flex-1 w-0 p-4"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            <div class="relative h-10 w-10">
              <img
                referrerPolicy="no-referrer"
                class="rounded-full"
                src={senderImg}
                alt={`${senderName} profile picture`}
              />
            </div>
          </div>

          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">{senderName}</p>
            <p class="mt-1 text-sm text-gray-500">{senderMessage}</p>
          </div>
        </div>
      </a>

      <div class="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UnseenChatToast;
