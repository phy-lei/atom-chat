import { Component, JSX, Show, createSignal } from 'solid-js';

interface ImgViewerProps extends JSX.ImgHTMLAttributes<HTMLImageElement> {}

const ImgViewer: Component<ImgViewerProps> = (props) => {
  const [show, setShow] = createSignal(false);
  // TODO: 改为像Toast一样的方式
  return (
    <>
      <img {...props} onClick={() => setShow(true)} />
      <Show when={show()} fallback={null}>
        <div class="fixed bg-black:[0.5] w-screen h-screen left-0 top-0 z-99 mt-0">
          <div class="absolute w-full h-full flex justify-center items-center">
            <img {...props} class="mt-20" />
            <div
              class="bg-black:[0.5] rounded-50% w-80px h-80px absolute -right-40px -top-40px hover:bg-black:[0.8] cursor-pointer"
              onClick={() => setShow(false)}
            >
              <i class="i-carbon:close-large absolute bottom-15px left-15px  bg-white"></i>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default ImgViewer;
