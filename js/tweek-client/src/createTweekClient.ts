import TweekClient from './TweekClient';
import { requestTimeout } from './utils';

export default function(config: {
  baseServiceUrl: string;
  context?: any;
  requestTimeoutInMillis?: number;
  getAuthenticationToken?: () => Promise<string> | string;
}) {
  const { baseServiceUrl, context = {}, getAuthenticationToken, requestTimeoutInMillis = 8000 } = config;

  let fetchClient = (input, init) => Promise.race([requestTimeout(requestTimeoutInMillis), fetch(input, init)]);
  if (getAuthenticationToken) {
    fetchClient = async (input, init = {}) => {
      const token = await Promise.resolve(getAuthenticationToken());
      return Promise.race([
        requestTimeout(requestTimeoutInMillis),
        fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
    };
  }

  return new TweekClient({
    baseServiceUrl,
    casing: 'camelCase',
    convertTyping: false,
    context,
    fetch: fetchClient,
  });
}
