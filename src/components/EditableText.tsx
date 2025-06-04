"use client";

import { useState, useRef } from "react";
import { Text, TextInput } from "@mantine/core";

export default function EditableText({
  initialValue,
  onSubmit,
  size
}: {
  initialValue: string;
  onSubmit: (value: string) => void;
  size?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  return isEditing ? (
    <TextInput
      ref={inputRef}
      value={value}
      size={size}
      onChange={(event) => setValue(event.currentTarget.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      className="w-[200px]"
    />
  ) : (
    <Text
      size={size}
      onClick={() => setIsEditing(true)}
      style={{ cursor: "pointer" }}
    >
      {value || "—"}
    </Text>
  );
}
