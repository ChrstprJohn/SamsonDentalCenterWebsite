export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Helper to process a failed server action response in a React Hook Form.
 * Maps field-level validation errors from the server directly to the form's setError function,
 * and returns the global error string (if any) to be displayed as a toast.
 * 
 * @param response The failed action response from the server
 * @param setError The setError function from react-hook-form
 * @returns The global error message, if it should be displayed as a toast
 */
export function handleActionError(
  response: { success: false; error: string; fieldErrors?: Record<string, string[]> },
  setError: any
): string | null {
  if (response.fieldErrors) {
    let hasFieldErrors = false;
    Object.entries(response.fieldErrors).forEach(([field, messages]) => {
      if (messages.length > 0) {
        hasFieldErrors = true;
        // Map the server error back to the RHF field
        setError(field as any, { type: 'server', message: messages[0] });
      }
    });

    // If we only had field errors, we might not want to show a generic toast,
    // but if we do, the UI can handle it. We return the generic error string just in case.
    if (hasFieldErrors && response.error === 'Validation failed') {
      return 'Please correct the highlighted fields.';
    }
  }

  // Return the main error string for toast notification
  return response.error;
}
