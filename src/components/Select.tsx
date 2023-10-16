import { createSignal, For, onMount } from 'solid-js';
import prompts from '@/utils/prompts';
import { EventName } from '@/utils/constants';
import clsx from 'clsx';

const Select = () => {
  const [show, setShow] = createSignal(false);
  const [prompt, setPrompt] = createSignal(prompts[0]);

  const handleClick = (item: (typeof prompts)[number], index: number) => {
    setPrompt(item);
    setShow(false);
    const event = new CustomEvent(EventName.SET_PROMPT, {
      detail: index,
    });
    window.dispatchEvent(event);
  };

  return (
    <div class="relative">
      <div
        class="w-50 h-10 border border-gray-200 hover:border-gray-600 rounded flex justify-between items-center pl-2 pr-2 cursor-pointer"
        onClick={() => setShow((flag) => !flag)}
      >
        <div class="whitespace-nowrap text-ellipsis overflow-hidden flex-1">
          {prompt().act}
        </div>
        <i
          class={clsx(
            'i-carbon:chevron-down transition-all',
            show() ? 'transform-rotate-180deg' : 'transform-rotate-0'
          )}
        ></i>
      </div>
      <div
        class={clsx(
          'absolute top-12 w-50 h-40 bg-white overflow-y-auto rounded border border-gray-200 pt-1 pb-1',
          show() ? 'block' : 'hidden'
        )}
      >
        <For each={prompts}>
          {(item, index) => (
            <div
              class={clsx(
                'pl-2 pr-2 lh-loose hover:bg-gray-200 text-14px cursor-pointer',
                item.act === prompt().act ? 'color-blue' : ''
              )}
              onClick={() => handleClick(item, index())}
            >
              {item.act}
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default Select;
