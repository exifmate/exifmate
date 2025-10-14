import { type ReactNode, useRef } from 'react';
import {
  type AriaModalOverlayProps,
  Overlay,
  useModalOverlay,
} from 'react-aria';
import type { OverlayTriggerState } from 'react-stately';

interface Props extends AriaModalOverlayProps {
  state: OverlayTriggerState;
  children: ReactNode;
}

function Modal({ state, children, ...props }: Props) {
  const ref = useRef(null);
  const { modalProps, underlayProps } = useModalOverlay(props, state, ref);

  if (!state.isOpen) {
    return null;
  }

  return (
    <Overlay>
      <div
        {...underlayProps}
        className="fixed top-0 bottom-0 left-0 right-0 z-10 bg-black/40 flex justify-center items-center"
      >
        <div {...modalProps} ref={ref}>
          {children}
        </div>
      </div>
    </Overlay>
  );
}

export default Modal;
