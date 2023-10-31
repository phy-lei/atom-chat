import { For, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { useThrottleFn } from 'solidjs-use';
import { generateSignature } from '@/utils/ai';
import MessageItem from './MessageItem';
import ErrorMessageItem from './ErrorMessageItem';
import Button from '../ui/Button';
import { EventName } from '@/utils/constants';
import type { ChatMessage, ErrorMessage } from '@/types/aiChat';

export default (props: { sessionImg: string }) => {
  let inputRef: HTMLTextAreaElement;
  let prompt = 0;
  const [currentSystemRoleSettings, setCurrentSystemRoleSettings] =
    createSignal('');
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([]);
  const [currentError, setCurrentError] = createSignal<ErrorMessage>();
  const [currentAssistantMessage, setCurrentAssistantMessage] =
    createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [controller, setController] = createSignal<AbortController>(null);
  const [isStick, setStick] = createSignal(false);

  createEffect(() => isStick() && smoothToBottom());

  onMount(() => {
    let lastPostion = window.scrollY;

    window.addEventListener('scroll', () => {
      const nowPostion = window.scrollY;
      nowPostion < lastPostion && setStick(false);
      lastPostion = nowPostion;
    });

    try {
      if (sessionStorage.getItem('messageList'))
        setMessageList(JSON.parse(sessionStorage.getItem('messageList')));

      if (sessionStorage.getItem('systemRoleSettings'))
        setCurrentSystemRoleSettings(
          sessionStorage.getItem('systemRoleSettings')
        );

      if (localStorage.getItem('stickToBottom') === 'stick') setStick(true);
    } catch (err) {
      console.error(err);
    }

    const setPrompt = (e: CustomEvent) => {
      prompt = e.detail;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener(EventName.SET_PROMPT, setPrompt);
    onCleanup(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener(EventName.SET_PROMPT, setPrompt);
    });
  });

  const handleBeforeUnload = () => {
    sessionStorage.setItem('messageList', JSON.stringify(messageList()));
    sessionStorage.setItem('systemRoleSettings', currentSystemRoleSettings());
    isStick()
      ? localStorage.setItem('stickToBottom', 'stick')
      : localStorage.removeItem('stickToBottom');
  };

  const handleButtonClick = async () => {
    const inputValue = inputRef.value;
    if (!inputValue) return;

    inputRef.value = '';
    setMessageList((prev) => [
      {
        role: 'user',
        content: inputValue,
      },
      ...prev,
    ]);

    requestWithLatestMessage();
    instantToBottom();
  };

  const smoothToBottom = useThrottleFn(
    () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    },
    300,
    false,
    true
  );

  const instantToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  };

  const requestWithLatestMessage = async () => {
    setLoading(true);
    setCurrentAssistantMessage('generating...');
    setCurrentError(null);
    try {
      const controller = new AbortController();
      setController(controller);
      const requestMessageList = [...messageList()];

      const timestamp = Date.now();
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          messages: requestMessageList.reverse(),
          time: timestamp,
          pass: '',
          prompt,
          sign: await generateSignature({
            t: timestamp,
            m:
              requestMessageList?.[requestMessageList.length - 1]?.content ||
              '',
          }),
        }),
        signal: controller.signal,
      });
      setCurrentAssistantMessage('');
      if (!response.ok) {
        const error = await response.json();
        console.error(error.error);
        setCurrentError(error.error);
        throw new Error('Request failed');
      }
      const data = response.body;
      if (!data) throw new Error('No data');

      const reader = data.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();

        if (value) {
          const char = decoder.decode(value);
          if (char === '\n' && currentAssistantMessage().endsWith('\n'))
            continue;

          if (char)
            setCurrentAssistantMessage(currentAssistantMessage() + char);

          isStick() && instantToBottom();
        }
        done = readerDone;
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setController(null);
      return;
    }
    archiveCurrentMessage();
    isStick() && instantToBottom();
  };

  const archiveCurrentMessage = () => {
    if (currentAssistantMessage()) {
      setMessageList([
        {
          role: 'assistant',
          content: currentAssistantMessage(),
        },
        ...messageList(),
      ]);
      setCurrentAssistantMessage('');
      setLoading(false);
      setController(null);
      // Disable auto-focus on touch devices
      if (
        !(
          'ontouchstart' in document.documentElement ||
          navigator.maxTouchPoints > 0
        )
      )
        inputRef.focus();
    }
  };

  const stopStreamFetch = () => {
    if (controller()) {
      controller().abort();
      archiveCurrentMessage();
    }
  };

  const retryLastFetch = () => {
    if (messageList().length > 0) {
      const lastMessage = messageList()[messageList().length - 1];
      if (lastMessage.role === 'assistant')
        setMessageList(messageList().slice(0, -1));
      requestWithLatestMessage();
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.isComposing || e.shiftKey) return;

    if (e.keyCode === 13) {
      e.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <>
      <div class="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {currentError() && (
          <ErrorMessageItem data={currentError()} onRetry={retryLastFetch} />
        )}
        {currentAssistantMessage() && (
          <MessageItem
            role="assistant"
            message={currentAssistantMessage()}
            sessionImg={props.sessionImg}
          />
        )}
        <For each={messageList()}>
          {(message, index) => (
            <MessageItem
              role={message.role}
              message={message.content}
              showRetry={() =>
                message.role === 'assistant' &&
                index() === messageList().length - 1
              }
              onRetry={retryLastFetch}
              sessionImg={props.sessionImg}
            />
          )}
        </For>
      </div>

      <div class="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
        <div class="relative flex flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
          <textarea
            ref={inputRef!}
            onKeyDown={handleKeydown}
            rows={1}
            disabled={loading()}
            placeholder="Ask me about anything you want"
            class="gen-textarea min-h-22 max-h-22"
            autofocus
          ></textarea>

          <div class="flex bg-(slate op-15) pr-2 pt-6">
            <div class="flex-shrin-0">
              <Button
                onClick={() => {
                  loading() ? stopStreamFetch() : handleButtonClick();
                }}
              >
                {loading() ? 'Stop' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
