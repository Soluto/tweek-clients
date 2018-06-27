export default maxExponent => {
  return (resume: () => void, retryCount, ex) => setTimeout(resume, 2 ** (retryCount - 1));
};
