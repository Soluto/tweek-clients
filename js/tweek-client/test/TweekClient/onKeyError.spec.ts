import sinon from 'sinon';
import { TweekClient } from '../../src';

describe('TweekClient onKeyError', () => {
  let fetchStub: sinon.SinonStub;
  let onKeyError: sinon.SinonStub;
  let tweekClient: TweekClient;

  beforeEach(() => {
    fetchStub = sinon.stub();
    onKeyError = sinon.stub();

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
