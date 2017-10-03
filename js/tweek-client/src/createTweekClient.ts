import TweekClient from './TweekClient';

export default function(config: {
  baseServiceUrl: string;
  context?: any;
  getAuthenticationToken?: () => Promise<string> | string;
}) {
  const { baseServiceUrl, context = {}, getAuthenticationToken } = config;

  let fetchClient = (input, init) => fetch(input, init);
  if (getAuthenticationToken) {
    fetchClient = async (input, init = {}) => {
      const token = await Promise.resolve(getAuthenticationToken());
      return fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        },
      });
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
