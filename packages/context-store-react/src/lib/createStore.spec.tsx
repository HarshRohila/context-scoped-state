import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Store } from './Store';
import { createStoreHook } from './createStore';

class CounterStore extends Store<{ count: number }> {
  protected getInitialState() {
    return { count: 0 };
  }

  increment() {
    this.setState({ count: this.getState().count + 1 });
  }
}

const useCounterStore = createStoreHook(CounterStore);

function TestCounter() {
  const store = useCounterStore();
  return (
    <div>
      <span data-testid="count">{store.state.count}</span>
      <button onClick={() => store.increment()}>Increment</button>
    </div>
  );
}

describe('createStoreHook', () => {
  it('should render initial state', () => {
    render(
      <useCounterStore.Context>
        <TestCounter />
      </useCounterStore.Context>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('should update state when action is called', async () => {
    render(
      <useCounterStore.Context>
        <TestCounter />
      </useCounterStore.Context>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should throw error when used outside context', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => render(<TestCounter />)).toThrow(
      'useStore must be used within a StoreContext'
    );

    console.error = originalError;
  });

  it('should share state between multiple consumers', () => {
    function Display() {
      const store = useCounterStore();
      return <span data-testid="display">{store.state.count}</span>;
    }

    function Button() {
      const store = useCounterStore();
      return <button onClick={() => store.increment()}>+</button>;
    }

    render(
      <useCounterStore.Context>
        <Display />
        <Button />
      </useCounterStore.Context>
    );

    expect(screen.getByTestId('display').textContent).toBe('0');

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('display').textContent).toBe('1');
  });
});
