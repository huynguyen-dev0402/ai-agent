export function extractSubscriptionAndUsername(input: string) {
  // Check if the string matches the expected format
  if (!input.startsWith('SEVQR') || !input.includes('TS')) {
    return { error: 'Invalid string format' };
  }

  // Extract parts
  const prefixLength = 5; // Length of "SEVQR"
  const tsIndex = input.indexOf('TS');

  // Extract the middle part (subscription_code + username)
  const middle = input.slice(prefixLength, tsIndex);

  // Extract timestamp
  const timestamp = input.slice(tsIndex + 2); // After "TS"

  // Without a clear separator, we return the middle part as is
  // If you have rules (e.g., subscription_code is 6 characters), you can split like:
  // const subscription_code = middle.slice(0, 6);
  // const username = middle.slice(6);

  return {
    subscription_code: 'Requires specific rules to isolate',
    username: 'Requires specific rules to isolate',
    combined: middle,
    timestamp: timestamp,
  };
}
