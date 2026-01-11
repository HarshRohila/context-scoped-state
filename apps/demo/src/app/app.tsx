import { Store, createStoreHook } from 'context-store-react';

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

// Create the hook
const useCounterStore = createStoreHook(CounterStore);

// Counter component
function Counter() {
  const counterStore = useCounterStore();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Counter: {counterStore.state.count}</h1>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={() => counterStore.decrement()}>-</button>
        <button onClick={() => counterStore.increment()}>+</button>
      </div>
    </div>
  );
}

// App with context provider
export function App() {
  return (
    <useCounterStore.Context>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ textAlign: 'center' }}>context-store-react Demo</h2>
        <Counter />
      </div>
    </useCounterStore.Context>
  );
}

export default App;
