import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for inline editing fields.
 *
 * @param {*} initialValue - The server/initial value
 * @param {function} onCommit - Called with new value when edit is committed (blur or Enter)
 * @returns {{ value, isEditing, startEdit, handleChange, handleBlur, handleKeyDown, inputRef }}
 */
export function useInlineEdit(initialValue, onCommit) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  // Sync if the server value changes while not editing
  useEffect(() => {
    if (!isEditing) {
      setValue(initialValue);
    }
  }, [initialValue, isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    // Focus the input on next frame
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select?.();
    });
  }, []);

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const commit = useCallback(() => {
    setIsEditing(false);
    if (value !== initialValue) {
      onCommit?.(value);
    }
  }, [value, initialValue, onCommit]);

  const handleBlur = useCallback(() => {
    commit();
  }, [commit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  }, [commit, initialValue]);

  return {
    value,
    isEditing,
    startEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
    inputRef,
  };
}
