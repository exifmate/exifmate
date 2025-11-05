import { ExifData } from '@metadata-handler/exifdata';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';
import { ZodEnum } from 'zod';

interface Props {
  tagName: keyof ExifData;
}

function ExifInput({ tagName }: Props) {
  const { register, formState } = useFormContext<ExifData>();

  const zodItem = ExifData.shape[tagName].unwrap();
  const tag = zodItem.type === 'pipe' ? zodItem.out : zodItem;

  const description = tag.meta()?.description;
  const errorMessage = formState.errors[tagName]?.message;

  const isDateInput =
    tagName === 'DateTimeOriginal' ||
    tagName === 'CreateDate' ||
    tagName === 'ModifyDate';

  const registration = register(tagName);
  registration.disabled = registration.disabled || formState.isSubmitting;

  const commonProps: HTMLAttributes<HTMLSelectElement | HTMLInputElement> = {
    id: tagName,
    'aria-invalid': !!errorMessage,
    'aria-describedby': errorMessage ? `${tagName}-error` : undefined,
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="label" htmlFor={tagName}>
        {tagName}
        {description && <span>({description})</span>}
      </label>

      {tag instanceof ZodEnum ? (
        <select {...registration} {...commonProps} className="select w-full">
          <option value="" disabled></option>
          {tag.options.map((option) => (
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
          type={isDateInput ? 'datetime-local' : 'text'}
          step={isDateInput ? 1 : undefined}
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
