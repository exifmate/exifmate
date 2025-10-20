import { useRef } from 'react';
import { type AriaToastProps, useButton, useToast } from 'react-aria';
import { MdClose } from 'react-icons/md';
import type { ToastState } from 'react-stately';
import type { ToastContent } from './toast-queue';

interface Props extends AriaToastProps<ToastContent> {
  state: ToastState<ToastContent>;
}

function Toast({ state, ...props }: Props) {
  const toastRef = useRef(null);
  const { toastProps, contentProps, titleProps, closeButtonProps } = useToast(
    props,
    state,
    toastRef,
  );
  const buttonRef = useRef(null);
  const { buttonProps } = useButton(closeButtonProps, buttonRef);

  const { level, message } = props.toast.content;

  return (
    <div {...toastProps} ref={toastRef} className={`alert alert-${level}`}>
      <div {...contentProps}>
        <div {...titleProps}>{message}</div>
      </div>

      <button {...buttonProps} className={`btn btn-sm btn-${level}`}>
        <MdClose size={16} />
      </button>
    </div>
  );
}

export default Toast;
