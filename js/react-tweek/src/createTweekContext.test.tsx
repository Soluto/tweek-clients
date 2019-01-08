import React from 'react';
import renderer from 'react-test-renderer';
import createTweekContext from './createTweekContext';

describe('createTweekContext', () => {
  test('default provider should prepare keys when prepare is called', () => {
    const prepare = jest.fn();
    const key = 'some_key_path';

    const context = createTweekContext({prepare} as any);

    context.prepare(key);

    expect(prepare).toHaveBeenCalledWith(key);
  });

  test('generated provider should prepare requested keys', () => {
    const prepare = jest.fn();
    const key = 'some_key_path';

    const Context = createTweekContext({prepare: jest.fn()} as any);
    Context.prepare(key);
    renderer.create(<Context.Provider value={{prepare} as any} />);

    expect(prepare).toHaveBeenCalledWith(key);
  });

  test('generated provider should prepare keys after render', () => {
    const prepare = jest.fn();
    const key = 'some_key_path';

    const Context = createTweekContext({prepare: jest.fn()} as any);
    renderer.create(<Context.Provider value={{prepare} as any} />);
    Context.prepare(key);

    expect(prepare).toHaveBeenCalledWith(key);
  })
});
