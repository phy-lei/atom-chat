import { createMemo, Show, For } from 'solid-js';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface ChatBubblesProps {
  isCurrentUser: boolean;
  message: Message;
  isRoundCorner: boolean;
  chatId: string;
  index: number;
}

const ChatBubble = (props: ChatBubblesProps) => {
  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'HH:mm');
  };

  const isImage = () => {
    const startStr = 'https://raw.githubusercontent.com/phy-lei/blob-imgs';
    const reg = /\.(png|jpg|jpeg)$/i;

    return (
      props.message.text.startsWith(startStr) && reg.test(props.message.text)
    );
  };

  const linkText = (text: string) => {
    const newText: { text: string; isLink: boolean }[] = [];
    const reg =
      /(https?:\/\/)?(([0-9a-z.]+\.[a-z]+)|(([0-9]{1,3}\.){3}[0-9]{1,3}))(:[0-9]+)?(\/[0-9a-z%/.\-_]*)?(\?[0-9a-z=&%_\-]*)?(\#[0-9a-z=&%_\-]*)?/gi;
    const matchArr = text.match(reg);
    if (!matchArr) {
      newText.push({
        text,
        isLink: false,
      });
    } else {
      let startIndex = 0;
      matchArr.forEach((str) => {
        const i = text.indexOf(str);
        const originText = text.slice(startIndex, i);
        newText.push({
          text: originText,
          isLink: false,
        });
        startIndex = i + str.length;
        newText.push({
          text: str,
          isLink: true,
        });
      });
      newText.push({
        text: text.slice(startIndex),
        isLink: false,
      });
    }

    return newText;
  };

  const handleDeleteMessage = async (_message: Message) => {
    if (!_message) return;
    try {
      // const toastId = toast.loading('message is being deleted...');
      // await axios
      //   .post('/api/message/delete', { chatId, message: [message], index })
      //   .then((res) => {
      //     if (res.status === 200) {
      //       if (res.data === 0) {
      //         toast.error('no message has been deleted !', {
      //           id: toastId,
      //           duration: 800,
      //         });
      //       } else {
      //         toast.success('message has been deleted ~', {
      //           id: toastId,
      //           duration: 800,
      //         });
      //       }
      //     }
      //   })
      //   .catch(() => {
      //     toast.error('Something went wrong. Please try again later.', {
      //       id: toastId,
      //       duration: 800,
      //     });
      //   });
    } catch {
      // toast.error('Something went wrong. Please try again later.');
    }
  };

  const messageList = linkText(props.message.text);

  return (
    <div
      class={clsx('flex flex-col space-y-2 text-base max-w-xs mx-2', {
        'order-1 items-end': props.isCurrentUser,
        'order-2 items-start': !props.isCurrentUser,
      })}
    >
      <Show when={props.isCurrentUser} fallback={null}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class={'cursor-pointer mr-26'}
          width="18"
          height="16"
          viewBox="0 0 40 40"
          onClick={() => handleDeleteMessage(props.message)}
        >
          <path
            fill="#888888"
            d="M32.937 7.304H27.19v-.956c0-1.345-.423-2.32-1.278-2.915c-.604-.39-1.353-.588-2.224-.588h-6.441c-.005 0-.009.003-.014.003c-.005 0-.009-.003-.014-.003h-.909c-2.259 0-3.503 1.244-3.503 3.503v.956H7.063a.75.75 0 0 0 0 1.5h.647l1.946 25.785c0 1.631.945 2.566 2.594 2.566h15.461c1.611 0 2.557-.93 2.592-2.51L32.25 8.804h.686a.75.75 0 0 0 .001-1.5zm-2.302 2.976H9.326l-.111-1.476h21.531l-.111 1.476zM14.308 6.348c0-1.423.58-2.003 2.003-2.003h7.378c.578 0 1.053.117 1.389.333c.413.287.613.833.613 1.67v.956H14.308v-.956zm14.498 28.224c-.019.81-.295 1.083-1.095 1.083H12.25c-.818 0-1.094-.269-1.096-1.123L9.439 11.779h21.082l-1.715 22.793z"
          />
          <path
            fill="#888888"
            d="M17.401 12.969a.749.749 0 0 0-.722.776l.704 19.354a.75.75 0 0 0 .748.723l.028-.001a.749.749 0 0 0 .722-.776l-.703-19.355c-.015-.414-.353-.757-.777-.721zm-4.649.001a.75.75 0 0 0-.696.8l1.329 19.354a.749.749 0 0 0 .747.698l.053-.002a.75.75 0 0 0 .696-.8l-1.329-19.354a.756.756 0 0 0-.8-.696zm9.784-.001c-.419-.04-.762.308-.776.722l-.705 19.354a.748.748 0 0 0 .722.776l.028.001a.75.75 0 0 0 .748-.723l.705-19.354a.748.748 0 0 0-.722-.776zm4.649.001a.757.757 0 0 0-.8.696L25.056 33.02a.75.75 0 0 0 .696.8l.053.002a.75.75 0 0 0 .747-.698l1.329-19.354a.75.75 0 0 0-.696-.8z"
          />
        </svg>
      </Show>
      <Show
        when={!isImage()}
        fallback={<img src={props.message.text} alt="picture" />}
      >
        <span
          class={clsx('px-4 py-2 rounded-lg inline-block', {
            'bg-indigo-600 text-white': props.isCurrentUser,
            'bg-gray-200 text-gray-900': !props.isCurrentUser,
            'rounded-br-none': !props.isRoundCorner && props.isCurrentUser,
            'rounded-bl-none': !props.isRoundCorner && !props.isCurrentUser,
          })}
        >
          <pre class="whitespace-pre-wrap break-all">
            <For each={messageList}>
              {(str) => (
                <span>
                  {str.isLink ? (
                    <a href={str.text} target="_blank" class="underline">
                      {str.text}
                    </a>
                  ) : (
                    str.text
                  )}
                </span>
              )}
            </For>
            <span class=" text-xs text-gray-400">
              {' '}
              {formatTimestamp(props.message.timestamp)}
            </span>
          </pre>
        </span>
      </Show>
    </div>
  );
};

export default ChatBubble;
