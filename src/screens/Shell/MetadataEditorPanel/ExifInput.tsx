import type { ExifData } from '@metadata-handler/exifdata';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
  tagName: keyof ExifData;
  description?: string;
} & (
  | {
      type?: 'datetime-local' | 'text';
    }
  | {
      type: 'select';
      options: readonly string[];
    }
);

function ExifInput({ tagName, description, ...props }: Props) {
  const { register, formState } = useFormContext<ExifData>();
  const errorMessage = formState.errors[tagName]?.message;

  const registration = register(tagName);
  registration.disabled = registration.disabled || formState.isSubmitting;

  const commonProps: HTMLAttributes<HTMLSelectElement | HTMLInputElement> = {
    ...registration,
    id: tagName,
    'aria-invalid': !!errorMessage,
    'aria-describedby': errorMessage ? `${tagName}-error` : undefined,
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="label" htmlFor={tagName}>
        {tagName}
        {description && <span>{description}</span>}
      </label>

      {props.type === 'select' ? (
        <select
          {...registration}
          {...commonProps}
          className={classNames('select w-full', {
            'select-error': errorMessage,
          })}
        >
          <option value="" />
          {props.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          {...registration}
          {...commonProps}
          className={classNames('input w-full', {
            'input-error': errorMessage,
          })}
          placeholder={tagName}
          type={props.type}
          step={props.type === 'datetime-local' ? 1 : undefined}
        />
      )}

      {errorMessage && (
        <p id={`${tagName}-error`} className="mt-1 text-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default ExifInput;
