"use client";

import { Textarea, TextareaProps } from "@mantine/core";
import { useState } from "react";

interface AutoResizingTextareaProps extends Omit<TextareaProps, "onSubmit"> {
  initialValue?: string;
  onBlurSubmit?: (value: string) => void;
}

export function AutoResizingTextarea({
  initialValue = "",
  onBlurSubmit,
  ...props
}: AutoResizingTextareaProps) {
  const [value, setValue] = useState(initialValue);

  const handleBlur = () => {
    if (onBlurSubmit && value !== initialValue) {
      onBlurSubmit(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.currentTarget.value);
    props.onChange?.(e);
  };

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      autosize
      minRows={3}
      maxRows={10}
      {...props}
    />
  );
}
