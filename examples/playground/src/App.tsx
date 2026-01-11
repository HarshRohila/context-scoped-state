import { useCounterStore } from './counterStore';

// Counter component
function Counter() {
  const counterStore = useCounterStore();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Counter: {counterStore.state.count}</h1>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => counterStore.decrement()}
          style={{ padding: '0.5rem 1rem', fontSize: '1.2rem' }}
        >
          -
        </button>
        <button
          onClick={() => counterStore.increment()}
          style={{ padding: '0.5rem 1rem', fontSize: '1.2rem' }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// App with context provider
function App() {
  return (
    <useCounterStore.Context>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>
          context-scoped-state Playground
        </h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Edit <code>src/counterStore.ts</code> to experiment!
        </p>
        <Counter />
      </div>
    </useCounterStore.Context>
  );
}

export default App;
