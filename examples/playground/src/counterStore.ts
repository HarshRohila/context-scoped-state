import { Store, createStoreHook } from 'context-scoped-state';

// Define a counter store
class CounterStore extends Store<{ count: number }> {
  protected getInitialState() {
    return { count: 0 };
  }

  increment() {
    this.setState({ count: this.getState().count + 1 });
  }

  decrement() {
    this.setState({ count: this.getState().count - 1 });
  }
}

// This single export is all you need!
export const useCounterStore = createStoreHook(CounterStore);
