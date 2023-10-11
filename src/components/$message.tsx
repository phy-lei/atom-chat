import { render } from 'solid-js/web';
import Button from './ui/Button';

interface Props {
  destroy: () => void;
  confirm: () => void;
  text: string;
}

const Warning = (props: Props) => {
  return (
    <div
      class="fixed w-screen h-screen left-0 top-0 z-99"
      onClick={props.destroy}
    >
      <div
        class="fixed min-w-375px left-50% top-50% -translate-y-50% -translate-x-50% rounded bg-white shadow-[var(--box-shadow-light)] p-4"
        style={{
          '--box-shadow-light': '0px 0px 12px rgba(0, 0, 0, .12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 class="mb-4 flex items-center">
          <i class="i-carbon:warning-filled inline-block text-5 color-#e6a23c mr-2"></i>
          Warning
        </h3>
        <p class="text-sm mb-4">{props.text}</p>

        <div class="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={props.destroy}>
            cancel
          </Button>
          <Button size="sm" onClick={props.confirm}>
            confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

const $message = ({ text }: { text: string }) => {
  return new Promise((resolve) => {
    const container = document.createElement('div');

    const dispose = render(
      () => <Warning text={text} destroy={destroy} confirm={confirm} />,
      container
    );

    function destroy() {
      dispose();
      document.body.removeChild(container);
    }

    function confirm() {
      destroy();
      resolve(null);
    }

    document.body.appendChild(container);
  });
};

export default $message;
