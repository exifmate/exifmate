import { type ExifData, exifData } from '@app/core/types';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';
import { ZodEnum } from 'zod/v4';

interface Props {
  tagName: keyof typeof exifData.shape;
}

function ExifInput({ tagName }: Props) {
  const { register, formState } = useFormContext<ExifData>();
  const tag = exifData.shape[tagName].unwrap();
  const description = tag.meta()?.description;
  const errorMessage = formState.errors[tagName]?.message;

  const isDateInput =
    tagName === 'DateTimeOriginal' ||
    tagName === 'CreateDate' ||
    tagName === 'ModifyDate';

  const registration = register(tagName);
  registration.disabled = registration.disabled || formState.isSubmitting;

  const describedBy = [];
  if (errorMessage) {
    describedBy.push(`${tagName}-error`);
  }
  if (description) {
    describedBy.push(`${tagName}-description`);
  }

  const commonProps: HTMLAttributes<HTMLSelectElement | HTMLInputElement> = {
    id: tagName,
    'aria-invalid': !!errorMessage,
    'aria-describedby': describedBy.join(' '),
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="label" htmlFor={tagName}>
        {tagName}
      </label>
      {description && <p id={`${tagName}-description`}>{description}</p>}

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
