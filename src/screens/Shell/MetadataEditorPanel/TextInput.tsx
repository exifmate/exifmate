import { FieldError, Input, Label, TextField } from '@heroui/react';
import type { ExifData } from '@metadata-handler/exifdata';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  tagName: keyof ExifData;
  description?: string;
}

function TextInput({ tagName, description }: Props) {
  const { control } = useFormContext<ExifData>();

  let label: string = tagName;
  if (description) {
    label = `${label} ${description}`;
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
          <TextField
            {...field}
            isDisabled={disabled}
            name={label}
            isInvalid={invalid}
            variant="secondary"
          >
            <Label>{label}</Label>
            <Input
              // Casting is needed because the `value` prop thinks it doesn't support numbers.
              // Coalescing is needed to resolve warnings about the inputs going from uncontrolled to controlled.
              value={(value as string) ?? ''}
              onChange={onChange}
            />
            <FieldError>{error?.message}</FieldError>
          </TextField>
        );
      }}
    />
  );
}

export default TextInput;
