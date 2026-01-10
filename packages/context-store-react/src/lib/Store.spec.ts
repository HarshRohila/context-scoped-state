import { describe, it, expect } from 'vitest';
import { Store } from './Store';

class TestStore extends Store<{ value: number }> {
  protected getInitialState() {
    return { value: 0 };
  }

  setValue(newValue: number) {
    this.setState({ value: newValue });
  }
}

describe('Store', () => {
  it('should initialize with initial state', () => {
    const store = new TestStore();
    expect(store.getState()).toEqual({ value: 0 });
  });

  it('should update state with setState', () => {
    const store = new TestStore();
    store.setValue(42);
    expect(store.getState()).toEqual({ value: 42 });
  });

  it('should emit state changes via state$', () => {
    const store = new TestStore();
    const values: number[] = [];

    store.state$().subscribe((state) => {
      values.push(state.value);
    });

    store.setValue(1);
    store.setValue(2);
    store.setValue(3);

    expect(values).toEqual([0, 1, 2, 3]);
  });

  it('should allow unsubscription from state$', () => {
    const store = new TestStore();
    const values: number[] = [];

    const subscription = store.state$().subscribe((state) => {
      values.push(state.value);
    });

    store.setValue(1);
    subscription.unsubscribe();
    store.setValue(2);

    expect(values).toEqual([0, 1]);
  });
});
