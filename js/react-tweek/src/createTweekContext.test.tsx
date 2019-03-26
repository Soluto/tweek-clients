import React from 'react';
import renderer from 'react-test-renderer';
import { TweekRepository } from 'tweek-local-cache';
import { createTweekContext } from './createTweekContext';

describe('createTweekContext', () => {
  let repository: TweekRepository;
  beforeEach(() => {
    repository = new TweekRepository({ client: {} as any });
  });

  test('default provider should prepare keys when prepare is called', () => {
    const prepare = jest.spyOn(repository, 'prepare');
    const key = 'some_key_path';

    const context = createTweekContext(repository);

    context.prepareKey(key);

    expect(prepare).toHaveBeenCalledWith(key);
  });

  test('generated provider should prepare requested keys', () => {
    const otherRepository = new TweekRepository({ client: {} as any });
    const prepare = jest.spyOn(otherRepository, 'prepare');
    const key = 'some_key_path';

    const Context = createTweekContext(repository);
    Context.prepareKey(key);
    renderer.create(<Context.Provider value={otherRepository} />);

    expect(prepare).toHaveBeenCalledWith(key);
  });

  test('generated provider should prepare keys after render', () => {
    const otherRepository = new TweekRepository({ client: {} as any });
    const prepare = jest.spyOn(otherRepository, 'prepare');
    const key = 'some_key_path';

    const Context = createTweekContext(repository);
    renderer.create(<Context.Provider value={otherRepository} />);
    Context.prepareKey(key);

    expect(prepare).toHaveBeenCalledWith(key);
  });
});
