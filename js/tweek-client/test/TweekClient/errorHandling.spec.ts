import sinon from 'sinon';
import { expect } from 'chai';
import { KeyValuesError, TweekClient } from '../../src';

describe('TweekClient errorHandling', () => {
  let fetchStub: sinon.SinonStub;
  let onKeyError: sinon.SinonStub;
  let tweekClient: TweekClient;

  beforeEach(() => {
    fetchStub = sinon.stub();
    onKeyError = sinon.stub();
  });

  describe('onKeyError', () => {
    beforeEach(() => {
      tweekClient = new TweekClient({
        baseServiceUrl: '',
        fetch: fetchStub,
        onKeyError,
      });
    });

    it('should not call onKeyError if errors is not in the response body', async () => {
      fetchStub.resolves(new Response(JSON.stringify({})));

      await tweekClient.getValues('');

      sinon.assert.notCalled(onKeyError);
    });

    it('should not call onKeyError if errors object is empty', async () => {
      fetchStub.resolves(new Response(JSON.stringify({ errors: {} })));

      await tweekClient.getValues('');

      sinon.assert.notCalled(onKeyError);
    });

    it('should call onKeyError if errors object contains errors', async () => {
      const errors = { some_key: 'some error' };
      fetchStub.resolves(new Response(JSON.stringify({ errors })));

      await tweekClient.getValues('');

      sinon.assert.calledOnce(onKeyError);
      sinon.assert.calledWithExactly(onKeyError, errors);
    });
  });

  describe('throwOnError', () => {
    beforeEach(() => {
      tweekClient = new TweekClient({
        baseServiceUrl: '',
        fetch: fetchStub,
        throwOnError: true,
      });
    });

    it('should not throw if errors is not in the response body', async () => {
      fetchStub.resolves(new Response(JSON.stringify({})));

      await tweekClient.getValues('');
    });

    it('should not throw if errors object is empty', async () => {
      fetchStub.resolves(new Response(JSON.stringify({ errors: {} })));

      await tweekClient.getValues('');
    });

    it('should throw if errors object contains errors', async () => {
      const errors = { some_key: 'some error' };
      fetchStub.resolves(new Response(JSON.stringify({ errors })));

      await expect(tweekClient.getValues('')).to.be.rejectedWith(KeyValuesError);
    });
  });

  it('should throw and call onKeyError if both are defined', async () => {
    tweekClient = new TweekClient({
      baseServiceUrl: '',
      fetch: fetchStub,
      onKeyError,
      throwOnError: true,
    });

    const errors = { some_key: 'some error' };
    fetchStub.resolves(new Response(JSON.stringify({ errors })));

    await expect(tweekClient.getValues('')).to.be.rejectedWith(KeyValuesError);

    sinon.assert.calledOnce(onKeyError);
    sinon.assert.calledWithExactly(onKeyError, errors);
  });
});
