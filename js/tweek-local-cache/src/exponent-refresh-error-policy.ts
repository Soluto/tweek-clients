import { RefreshErrorPolicy } from './types';

export default (): RefreshErrorPolicy => {
  return (resume: () => void, retryCount) => setTimeout(resume, 2 ** (retryCount - 1));
};
