import { createSignal } from 'solid-js';
import { signOut } from '@solid-auth/base/client';
import Button from './ui/Button';

const SignOutButton = (props) => {
  const [isSigningOut, setIsSigningOut] = createSignal<boolean>(false);

  return (
    <Button
      {...props}
      variant="ghost"
      onClick={async () => {
        setIsSigningOut(true);
        await signOut();
      }}
    >
      {isSigningOut() ? (
        <div class="i-mingcute-loading-fill h-4 w-4 animate-spin" />
      ) : (
        <div class="i-carbon:exit h-4 w-4" />
      )}
    </Button>
  );
};

export default SignOutButton;
