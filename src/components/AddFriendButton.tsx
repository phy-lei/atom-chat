import { createSignal } from 'solid-js';
import Button from './ui/Button';

const AddFriendButton = () => {
  const [showSuccessState, setShowSuccessState] = createSignal<boolean>(false);
  const [message, setMessage] = createSignal('');

  const addFriend = async (email: string) => {};

  const handleSubmit = () => {};

  return (
    <form onSubmit={handleSubmit} class="max-w-sm">
      <label
        html-for="email"
        class="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>

      <div class="mt-2 flex gap-4">
        <input
          type="text"
          class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button>Add</Button>
      </div>
      <p class="mt-1 text-sm text-red-600">{message()}</p>
      {showSuccessState() ? (
        <p class="mt-1 text-sm text-green-600">Friend request sent!</p>
      ) : null}
    </form>
  );
};

export default AddFriendButton;
