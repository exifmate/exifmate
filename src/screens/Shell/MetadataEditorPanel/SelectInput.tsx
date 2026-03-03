import { FieldError, Label, ListBox, Select } from '@heroui/react';
import type { ExifData } from '@metadata-handler/exifdata';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  tagName: keyof ExifData;
  description?: string;
  options: readonly string[];
}

function SelectInput({ tagName, description, options }: Props) {
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
        field: { disabled, onChange, ...field },
        fieldState: { invalid, error },
      }) => {
        // TODO: need to handle when the value is already a non-standard value
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
