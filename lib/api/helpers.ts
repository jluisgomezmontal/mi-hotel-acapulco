export const unwrapPayload = <T>(payload: T | { data?: T } | { results?: T }): T => {
  if (payload && typeof payload === 'object') {
    if ('data' in payload && payload.data !== undefined) {
      return payload.data as T;
    }

    if ('results' in payload && payload.results !== undefined) {
      return payload.results as T;
    }
  }

  return payload as T;
};
