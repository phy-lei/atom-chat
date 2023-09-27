import { createSignal, Switch, Match, type JSX } from 'solid-js';
import { useClipboard } from 'solidjs-use';
import toast from 'solid-toast';
import Button from './ui/Button';

enum MessageTypes {
  error = 'error',
  success = 'success',
  null = '',
}

const ownerEmail = import.meta.env.PUBLIC_OWNER_EMAIL;

const AddFriendButton = (props) => {
  const { copy } = useClipboard();
  const [value, setValue] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal({
    type: MessageTypes.null,
    text: '',
  });
  const regEmail =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const addFriend = async (email: string) => {
    setLoading(true);
    const res = await fetch('/api/friends/add', {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    });
    const responseJson = await res.json();
    if (res.ok) {
      setMessage({
        type: MessageTypes.success,
        text: '',
      });
    } else {
      setMessage({
        type: MessageTypes.error,
        text: responseJson.message,
      });
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!regEmail.test(value())) {
      setMessage({
        type: MessageTypes.error,
        text: 'Invalid email',
      });
      return;
    }
    addFriend(value());
  };

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    event
  ) => {
    setValue(event.currentTarget.value);
    if (message().type === MessageTypes.error && regEmail.test(value())) {
      setMessage({
        type: MessageTypes.null,
        text: '',
      });
    }
  };

  const handleCopy = () => {
    copy(ownerEmail);
    toast.success('email has been copied done');
  };

  return (
    <div class="max-w-md">
      <label
        html-for="email"
        class="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>

      <div class="mt-2 flex gap-4 xs-flex-col sm-flex-row">
        <input
          type="text"
          class="block flex-1 rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
          onInput={handleInput}
        />
        <Button onClick={handleSubmit} isLoading={loading()}>
          {loading() ? null : 'Add'}
        </Button>
        <Button onClick={handleCopy}>Copy author email</Button>
      </div>
      <Switch fallback={null}>
        <Match when={message().type === MessageTypes.success}>
          <p class="mt-1 text-sm text-green-600">Friend request sent!</p>
        </Match>
        <Match when={message().type === MessageTypes.error}>
          <p class="mt-1 text-sm text-red-600">{message().text}</p>
        </Match>
      </Switch>
    </div>
  );
};

export default AddFriendButton;
