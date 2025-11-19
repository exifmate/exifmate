import type { ReactNode } from 'react';

interface Props {
  legend: string;
  children: ReactNode;
}

function Fieldset({ legend, children }: Props) {
  // TODO: migrate
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="">{legend}</legend>
      {children}
    </fieldset>
  );
}

export default Fieldset;
