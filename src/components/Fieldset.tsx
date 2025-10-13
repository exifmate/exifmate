import type { ReactNode } from 'react';

interface Props {
  legend: string;
  children: ReactNode;
}

function Fieldset({ legend, children }: Props) {
  return (
    <fieldset className="fieldset p-4 rounded-box bg-neutral gap-3 text-sm">
      <legend className="fieldset-legend">{legend}</legend>
      {children}
    </fieldset>
  );
}

export default Fieldset;
