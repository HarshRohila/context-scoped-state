import { describe, it, expect } from 'vitest';
import { Store } from './Store';

class TestStore extends Store<{ value: number }> {
  protected getInitialState() {
    return { value: 0 };
  }

  setValue(newValue: number) {
    this.setState({ value: newValue });
  }

  incrementValue() {
    this.setState((prev) => ({ value: prev.value + 1 }));
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

  it('should update state with callback-based setState', () => {
    const store = new TestStore();
    store.setValue(5);
    store.incrementValue();
    expect(store.getState()).toEqual({ value: 6 });
  });
});

class MultiPropStore extends Store<{ value: number; name: string }> {
  protected getInitialState() {
    return { value: 0, name: 'initial' };
  }

  patchValue(newValue: number) {
    this.patchState({ value: newValue });
  }

  patchName(newName: string) {
    this.patchState({ name: newName });
  }

  incrementWithPatch() {
    this.patchState((state) => ({ value: state.value + 1 }));
  }
}

describe('Store patchState', () => {
  it('should partially update state with direct value', () => {
    const store = new MultiPropStore();
    store.patchValue(42);
    expect(store.getState()).toEqual({ value: 42, name: 'initial' });
  });

  it('should partially update state preserving other properties', () => {
    const store = new MultiPropStore();
    store.patchName('updated');
    expect(store.getState()).toEqual({ value: 0, name: 'updated' });
  });

  it('should partially update state with callback', () => {
    const store = new MultiPropStore();
    store.patchValue(5);
    store.incrementWithPatch();
    expect(store.getState()).toEqual({ value: 6, name: 'initial' });
  });
});
