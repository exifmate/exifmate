import type { ReactNode } from 'react';

interface Props {
  legend: string;
  children: ReactNode;
}

function Fieldset({ legend, children }: Props) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2">{legend}</legend>
      {children}
    </fieldset>
  );
}

export default Fieldset;
