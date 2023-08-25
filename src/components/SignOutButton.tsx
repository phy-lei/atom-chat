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
      {isSigningOut ? (
        <div class="i-mingcute-loading-fill  h-4 w-4 animate-spin" />
      ) : (
        // <LogOut className='w-4 h-4' />
        <div>123</div>
      )}
    </Button>
  );
};

export default SignOutButton;
