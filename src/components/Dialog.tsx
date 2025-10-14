import { type ReactNode, useRef } from 'react';
import { type AriaDialogProps, useDialog } from 'react-aria';

interface Props extends AriaDialogProps {
  title?: string;
  children: ReactNode;
}

function Dialog({ title, children, ...props }: Props) {
  const ref = useRef(null);
  const { dialogProps, titleProps } = useDialog(props, ref);

  return (
    <div
      {...dialogProps}
      ref={ref}
      className="card card-border bg-base-100 w-4xl fade-in"
    >
      <div className="card-body">
        <h2 className="card-title" {...titleProps}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export default Dialog;
