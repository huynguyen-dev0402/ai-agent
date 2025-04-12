export function successResponse(message: string, data: Record<string, any>) {
  return {
    success: true,
    message,
    ...data,
  };
}
