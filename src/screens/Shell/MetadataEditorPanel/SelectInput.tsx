import { FieldError, Label, ListBox, Select } from '@heroui/react';
import type { ExifData } from '@metadata-handler/exifdata';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  tagName: keyof ExifData;
  description?: string;
  options: readonly string[];
}

function SelectInput({ tagName, description, options }: Props) {
  const { control, getValues } = useFormContext<ExifData>();

  const nonStandardValueRef = useRef<string | null>(null);
  const currentValue = getValues(tagName) as string | null;
  if (currentValue != null && !options.includes(currentValue)) {
    nonStandardValueRef.current = currentValue;
  }
  const nonStandardValue = nonStandardValueRef.current;

  let label: string = tagName;
  if (description) {
    label = `${label} ${description}`;
  }

  return (
    <Controller
      control={control}
      name={tagName}
      render={({
        field: { disabled, onChange, ...field },
        fieldState: { invalid, error },
      }) => {
        return (
          <Select
            {...field}
            variant="secondary"
            isDisabled={disabled}
            isInvalid={invalid}
            onChange={(newValue) => {
              if (newValue === '__clear__') {
                onChange(null);
              } else {
                onChange(newValue);
              }
            }}
          >
            <Label>{label}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <FieldError>{error?.message}</FieldError>
            <Select.Popover>
              <ListBox>
                <ListBox.Item textValue="Clear Value" id="__clear__" />
                {nonStandardValue && (
                  <ListBox.Item
                    id={nonStandardValue}
                    textValue={nonStandardValue}
                    isDisabled
                  >
                    {nonStandardValue}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                )}

                {options.map((option) => (
                  <ListBox.Item key={option} id={option} textValue={option}>
                    {option}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        );
      }}
    />
  );
}

export default SelectInput;
