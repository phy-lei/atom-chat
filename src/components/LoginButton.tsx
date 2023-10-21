import { createSignal } from 'solid-js';
import { signIn } from '@auth/solid-start/client';
import Button from './ui/Button';

const ownerEmail = import.meta.env.PUBLIC_OWNER_EMAIL;
const LoginButton = () => {
  const [isLoading, setIsLoading] = createSignal(false);
  const signInHandler = async () => {
    console.log(
      '%c [ xxx ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      ownerEmail
    );
    setIsLoading(true);
    signIn('github');
  };
  return (
    <Button
      isLoading={isLoading()}
      class="max-w-sm mx-auto w-full mt-8"
      onClick={signInHandler}
    >
      {isLoading() ? null : (
        <div class="i-carbon:logo-github mr-2 h-5 w-5"></div>
      )}
      Sign in with GitHub
    </Button>
  );
};

export default LoginButton;
