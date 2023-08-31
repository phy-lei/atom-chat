import { Show, For } from 'solid-js';
import { clsx } from 'clsx';
import toast from 'solid-toast';
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

    const toastId = toast.loading('message is being deleted...');
    const res = await fetch('/api/message/delete', {
      method: 'POST',
      body: JSON.stringify({
        message: [_message],
        chatId: props.chatId,
        index: props.index,
      }),
    });
    if (res.ok) {
      toast.success('message has been deleted ~', {
        id: toastId,
        duration: 800,
      });
    } else {
      toast.error('no message has been deleted !', {
        id: toastId,
        duration: 800,
      });
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
        <i
          class="i-carbon:trash-can cursor-pointer"
          onClick={() => handleDeleteMessage(props.message)}
        ></i>
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
