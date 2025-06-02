"use client";

import { useState, useRef } from "react";
import { Text, TextInput } from "@mantine/core";

export default function EditableText({
  initialValue,
  onSubmit,
}: {
  initialValue: string;
  onSubmit: (value: string) => void;
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
      onChange={(event) => setValue(event.currentTarget.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  ) : (
    <Text onClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
      {value || "—"}
    </Text>
  );
}
