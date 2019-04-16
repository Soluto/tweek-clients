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

  describe('onKeyValueError', () => {
    beforeEach(() => {
      tweekClient = new TweekClient({
        baseServiceUrl: '',
        fetch: fetchStub,
        onKeyValueError: onKeyError,
      });
    });

    it('should not call onKeyValueError if errors is not in the response body', async () => {
      fetchStub.resolves(new Response(JSON.stringify({})));

      await tweekClient.getValues('');

      sinon.assert.notCalled(onKeyError);
    });

    it('should not call onKeyValueError if errors object is empty', async () => {
      fetchStub.resolves(new Response(JSON.stringify({ errors: {} })));

      await tweekClient.getValues('');

      sinon.assert.notCalled(onKeyError);
    });

    it('should call onKeyValueError if errors object contains errors', async () => {
      const errors = {
        some_key: 'some error',
        other_key: 'other error',
      };
      fetchStub.resolves(new Response(JSON.stringify({ errors })));

      await tweekClient.getValues('');

      Object.entries(errors).forEach(([keyPath, error]) => sinon.assert.calledWithExactly(onKeyError, keyPath, error));
    });
  });

  describe('throwOnKeyValueError', () => {
    beforeEach(() => {
      tweekClient = new TweekClient({
        baseServiceUrl: '',
        fetch: fetchStub,
        throwOnKeyValueError: true,
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

  it('should throw and call onKeyValueError if both are defined', async () => {
    const keyPath = 'some_key';
    const error = 'some error';

    tweekClient = new TweekClient({
      baseServiceUrl: '',
      fetch: fetchStub,
      onKeyValueError: onKeyError,
      throwOnKeyValueError: true,
    });

    fetchStub.resolves(new Response(JSON.stringify({ errors: { [keyPath]: error } })));

    await expect(tweekClient.getValues('')).to.be.rejectedWith(KeyValuesError);

    sinon.assert.calledOnce(onKeyError);
    sinon.assert.calledWithExactly(onKeyError, keyPath, error);
  });
});
