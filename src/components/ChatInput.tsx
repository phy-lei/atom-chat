import { createSignal } from 'solid-js';
import toast from 'solid-toast';
import Button from './ui/Button';

interface ChatInputProps {
  chatPartner: User;
  chatId: string;
}

const ChatInput = (props: ChatInputProps) => {
  let textareaRef: HTMLTextAreaElement | null;
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [input, setInput] = createSignal<string>('');

  const sendMessage = async (value: string) => {
    if (!value) return;
    setInput('');
    setIsLoading(true);
    const res = await fetch('/api/message/send', {
      method: 'POST',
      body: JSON.stringify({
        text: value,
        chatId: props.chatId,
      }),
    });
    if (!res.ok) {
      setInput(value);
      toast.error('Something went wrong. Please try again later.');
    }
    textareaRef?.focus();
    setIsLoading(false);
  };

  const uploadPasteImages = (event: ClipboardEvent) => {
    return new Promise<string | null>((resolve, reject) => {
      const cvs = event.clipboardData.items;
      if (!event.clipboardData || !cvs) {
        resolve(null);
      }
      const item = cvs[cvs.length - 1];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (item.type.match('^image/')) {
          setIsLoading(true);
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async function (e: any) {
            const base64 = e.target.result.split('base64,')[1];
            resolve(base64);
          };
        }
      } else {
        resolve(null);
      }
    });
  };

  const handlePaste = async (event: ClipboardEvent) => {
    uploadPasteImages(event).then(async (res: string | null) => {
      if (res) {
        const response = await fetch('/api/file/upload', {
          method: 'POST',
          body: JSON.stringify({
            base64: res,
          }),
        });
        const responseJson = await response.json();

        if (response.ok) {
          sendMessage(responseJson.data);
        }
      }
    });
  };

  return (
    <div class="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div class="relative flex flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <textarea
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.keyCode === 13 && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input());
            }
          }}
          onPaste={(e) => handlePaste(e)}
          rows={1}
          disabled={isLoading()}
          value={input()}
          onInput={(e) => setInput(e.target.value)}
          placeholder={`Message ${props.chatPartner.name}`}
          class="gen-textarea min-h-22 max-h-22"
          autofocus
        ></textarea>

        <div class="flex bg-(slate op-15) pr-2 pt-6">
          <div class="flex-shrin-0">
            <Button
              isLoading={isLoading()}
              onClick={() => sendMessage(input())}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
