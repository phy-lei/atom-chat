import { createSignal, createMemo, Show } from 'solid-js';
import { clsx } from 'clsx';
import MarkdownIt from 'markdown-it';
import mdKatex from 'markdown-it-katex';
import mdHighlight from 'markdown-it-highlightjs';
import { useClipboard, useEventListener } from 'solidjs-use';
import type { Accessor } from 'solid-js';
import type { ChatMessage } from '@/types/aiChat';

interface Props {
  role: ChatMessage['role'];
  message: Accessor<string> | string;
  sessionImg: string;
  showRetry?: Accessor<boolean>;
  onRetry?: () => void;
}

export default (props: Props) => {
  const [source] = createSignal('');
  const { copy, copied } = useClipboard({ source, copiedDuring: 1000 });

  useEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    let code = null;

    if (el.matches('div > div.copy-btn')) {
      code = decodeURIComponent(el.dataset.code!);
      copy(code);
    }
    if (el.matches('div > div.copy-btn > svg')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      code = decodeURIComponent(el.parentElement?.dataset.code!);
      copy(code);
    }
  });

  const htmlString = () => {
    const md = MarkdownIt({
      linkify: true,
      breaks: true,
    })
      .use(mdKatex)
      .use(mdHighlight);
    const fence = md.renderer.rules.fence!;
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args;
      const token = tokens[idx];
      const rawCode = fence(...args);

      return `<div relative>
      <div data-code=${encodeURIComponent(
        token.content
      )} class="copy-btn gpt-copy-btn group">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
            <div class="group-hover:op-100 gpt-copy-tips">
              ${copied() ? 'Copied' : 'Copy'}
            </div>
      </div>
      ${rawCode}
      </div>`;
    };

    return md.render(props.message);
  };

  const isCurrentUser = createMemo(() => props.role === 'user');

  return (
    <div
      class={clsx('transition-colors md:hover:bg-slate/3 flex items-end', {
        'justify-end': isCurrentUser(),
      })}
    >
      <div
        class={clsx('flex flex-col space-y-2 text-base max-w-xs mx-2', {
          'order-1 items-end': isCurrentUser(),
          'order-2 items-start': !isCurrentUser(),
        })}
      >
        <Show when={props.showRetry?.() && props.onRetry} fallback={null}>
          <div>
            <div onClick={props.onRetry} class="gpt-retry-btn">
              retry
            </div>
          </div>
        </Show>
        <div
          class={clsx('px-4 py-2 rounded-lg inline-block', {
            'bg-indigo-600 text-white': isCurrentUser(),
            'bg-gray-200 text-gray-900': !isCurrentUser(),
          })}
          innerHTML={htmlString()}
        />
      </div>
      <div
        class={clsx('relative w-6 h-6', {
          'order-2': isCurrentUser(),
          'order-1': !isCurrentUser(),
        })}
      >
        <img
          src={isCurrentUser() ? (props.sessionImg as string) : '/robot.svg'}
          alt="Profile picture"
          class="rounded-full"
        />
      </div>
    </div>
  );
};
