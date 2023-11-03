import { Suspense, createSignal } from 'solid-js';
import { EmojiPicker } from 'solid-emoji-picker';
import type { Emoji } from 'solid-emoji-picker';
import '@/assets/emoji-picker.css';

interface Props {
  setEmoji?: (emoji: Emoji['emoji']) => void;
}

const EmojiPickerModal = (props: Props) => {
  const [search, setSearch] = createSignal('');

  const emojiFilter = (emoji: Emoji) => {
    if (parseFloat(emoji.emoji_version) > 14) return false;
    return emoji.name.includes(search());
  };

  const handleEmojiPick = (emoji: Emoji) => {
    props.setEmoji && props.setEmoji(emoji.emoji);
  };

  return (
    <div class="pb-3">
      <div>
        <input
          type="text"
          class="w-full px-2 py-1 border border-base input-base  focus:border-base-100"
          placeholder="Search an emoji"
          value={search()}
          onInput={(e) => {
            setSearch(e.currentTarget.value);
          }}
        />
      </div>
      <div class="mt-2 -mx-1 h-[16rem] overflow-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2">
        <Suspense
          fallback={
            <div class="mt-[8rem] mx-auto fcc text-base i-carbon:circle-solid  text-slate-400 animate-ping" />
          }
        >
          <EmojiPicker filter={emojiFilter} onEmojiClick={handleEmojiPick} />
        </Suspense>
      </div>
    </div>
  );
};

export default EmojiPickerModal;
