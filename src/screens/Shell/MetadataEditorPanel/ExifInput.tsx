import {
  Calendar,
  DateField,
  DatePicker,
  type DateValue,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  TimeField,
  type TimeValue,
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

          try {
            if (!invalid && typeof value === 'string') {
              parsedValue = parseDateTime(value);
            }
          } catch {
            parsedValue = null;
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
              name="date"
              value={parsedValue}
              onChange={(date) => {
                onChange(date?.toString());
              }}
              isDisabled={disabled}
              validationBehavior="aria"
              isInvalid={invalid}
            >
              {({ state }) => (
                <>
                  <Label>{label}</Label>
                  <DateField.Group fullWidth>
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>

                  <FieldError>{error?.message}</FieldError>

                  <DatePicker.Popover className="flex flex-col gap-3">
                    <Calendar aria-label="Event date">
                      <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                          <Calendar.YearPickerTriggerHeading />
                          <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => (
                            <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                          )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                      <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                          {({ year }) => (
                            <Calendar.YearPickerCell year={year} />
                          )}
                        </Calendar.YearPickerGridBody>
                      </Calendar.YearPickerGrid>
                    </Calendar>
                    <div className="flex items-center justify-between">
                      <Label>Time</Label>
                      <TimeField
                        aria-label="Time"
                        granularity="second"
                        name="time"
                        value={state.timeValue}
                        onChange={(v) => state.setTimeValue(v as TimeValue)}
                      >
                        <TimeField.Group variant="secondary">
                          <TimeField.Input>
                            {(segment) => (
                              <TimeField.Segment segment={segment} />
                            )}
                          </TimeField.Input>
                        </TimeField.Group>
                      </TimeField>
                    </div>
                  </DatePicker.Popover>
                </>
              )}
            </DatePicker>
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
          field: { disabled, onChange, ...field },
          fieldState: { invalid, error },
        }) => {
          // TODO: need to handle when the value is already a non-standard value
          return (
            <Select
              {...field}
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
                  {props.options.map((option) => (
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

export default ExifInput;
