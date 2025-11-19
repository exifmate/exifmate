import {
  DatePicker,
  type DateValue,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { parseDateTime } from '@internationalized/date';
import type { ExifData } from '@metadata-handler/exifdata';
import { Controller, useFormContext } from 'react-hook-form';

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
  // Need to use a controlled inputs or else the inputs go shit when changing images.
  const { control } = useFormContext<ExifData>();

  let label: string = tagName;
  if (description) {
    label = `${label} ${description}`;
  }

  if (props.type === 'datetime-local') {
    return (
      <Controller
        control={control}
        name={tagName}
        render={({
          field: { value, disabled, onChange, ...field },
          fieldState: { invalid, error },
        }) => {
          let parsedValue: DateValue | null = null;

          if (!invalid && typeof value === 'string') {
            parsedValue = parseDateTime(value);
          }

          // When starting with a date, if a segment is removed then the `onChange` `date` is `null`,
          // which causes the date to be removed (which it either should or should be marked as invalid).
          // However, when it reloads the exif data, because the value comes back as `undefined` (so
          // `parsedValue` is `null`), the input doesn't get blanked out and shows the partial value.
          // There doesn't seem to be a way to clear the date manually (only to default to a date again,
          // but then that prevents removing a date or preserving no date). If there were a way to reset
          // the input then maybe state could be used to indicate if it had a date, saved, and needs clearing.
          //
          // Partial dates setting the value to `undefined` also prevents having a message to a user that
          // it's invalid, since it's marked as optional in Zod.
          //
          // Both of these seem to be the behavior for normal `datetime-locale` inputs (at least with Safari).
          return (
            <DatePicker
              {...field}
              granularity="second"
              label={label}
              value={parsedValue}
              onChange={(date) => {
                onChange(date?.toString());
              }}
              isDisabled={disabled}
              validationBehavior="aria"
              isInvalid={invalid}
              errorMessage={error?.message}
            />
          );
        }}
      />
    );
  }

  if (props.type === 'select') {
    return (
      <Controller
        control={control}
        name={tagName}
        render={({
          field: { disabled, value, ...field },
          fieldState: { invalid, error },
        }) => {
          return (
            <Select
              {...field}
              isClearable
              label={label}
              value={value as string}
              isDisabled={disabled}
              validationBehavior="aria"
              isInvalid={invalid}
              errorMessage={error?.message}
            >
              {props.options.map((option) => (
                <SelectItem key={option}>{option}</SelectItem>
              ))}
            </Select>
          );
        }}
      />
    );
  }

  return (
    <Controller
      control={control}
      name={tagName}
      render={({
        field: { disabled, value, onChange, ...field },
        fieldState: { invalid, error },
      }) => {
        return (
          <Input
            {...field}
            isDisabled={disabled}
            label={label}
            // Casting is needed because the `value` prop thinks it doesn't support numbers.
            // Coalescing is needed to resolve warnings about the inputs going from uncontrolled to controlled.
            value={(value as string) ?? ''}
            onValueChange={onChange}
            validationBehavior="aria"
            isInvalid={invalid}
            errorMessage={error?.message}
          />
        );
      }}
    />
  );
}

export default ExifInput;
