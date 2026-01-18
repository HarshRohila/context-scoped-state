<div align="center">
  <img src="./logo.svg" alt="context-scoped-state logo" width="120" height="120">
  <h1>context-scoped-state</h1>
  <p><strong>State management that respects component boundaries.</strong></p>
</div>

Unlike global state libraries (Redux, Zustand), `context-scoped-state` keeps your state where it belongs — scoped to the component tree that needs it. Each context provider creates an independent store instance, making your components truly reusable and your tests truly isolated.

## Why Scoped State?

Global state is convenient, but it comes with hidden costs:

- **Testing nightmares** — State leaks between tests, requiring complex cleanup
- **Component coupling** — Reusing components means sharing their global state
- **Implicit dependencies** — Components magically depend on global singletons

`context-scoped-state` solves this by leveraging React's Context API the right way. Same API simplicity, but with proper encapsulation.

## Installation

```bash
npm install context-scoped-state
```

```bash
yarn add context-scoped-state
```

```bash
pnpm add context-scoped-state
```

> **Peer Dependencies:** React 18+

## Try it Online

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/HarshRohila/context-scoped-state/tree/master/examples/playground)

## Quick Start

### 1. Create Your Store (one file, one export)

> Wondering why classes? See [API Design Choices](#api-design-choices).

```tsx
// counterStore.ts
import { Store, createStoreHook } from 'context-scoped-state';

class CounterStore extends Store<{ count: number }> {
  protected getInitialState() {
    return { count: 0 };
  }

  increment() {
    // Callback-based: receives current state, returns new state
    this.setState((state) => ({ count: state.count + 1 }));
  }

  decrement() {
    // Direct value: pass the new state directly
    this.setState({ count: this.getState().count - 1 });
  }
}

// This single export is all you need
export const useCounterStore = createStoreHook(CounterStore);
```

### 2. Use in Your App

```tsx
import { useCounterStore } from './counterStore';

function Counter() {
  const counterStore = useCounterStore();

  return (
    <div>
      <span>{counterStore.state.count}</span>
      <button onClick={() => counterStore.increment()}>+</button>
      <button onClick={() => counterStore.decrement()}>-</button>
    </div>
  );
}

function App() {
  return (
    <useCounterStore.Context>
      <Counter />
    </useCounterStore.Context>
  );
}
```

That's it. One hook export gives you the hook and its `.Context` provider. No extra setup needed.

### Partial State Updates with patchState

For stores with multiple properties, use `patchState` to update only specific fields:

```tsx
class UserStore extends Store<{ name: string; age: number; email: string }> {
  protected getInitialState() {
    return { name: '', age: 0, email: '' };
  }

  updateName(name: string) {
    // Only updates name, preserves age and email
    this.patchState({ name });
  }

  incrementAge() {
    // Callback-based: receives current state, returns partial update
    this.patchState((state) => ({ age: state.age + 1 }));
  }
}
```

- `setState` — Replaces the entire state
- `patchState` — Merges partial updates into existing state

## Examples

### Independent Nested Stores

Each `Context` creates a completely independent store instance. Perfect for reusable widget patterns:

```tsx
function PlayerScore() {
  const store = useScoreStore();
  return <span>Score: {store.state.score}</span>;
}

function Game() {
  return (
    <div>
      {/* Player 1 has their own score */}
      <useScoreStore.Context>
        <h2>Player 1</h2>
        <PlayerScore />
      </useScoreStore.Context>

      {/* Player 2 has their own score */}
      <useScoreStore.Context>
        <h2>Player 2</h2>
        <PlayerScore />
      </useScoreStore.Context>
    </div>
  );
}
```

Both players have completely independent state — no configuration needed.

### Testing with MockContext

Test components in any state without complex setup:

```tsx
import { render, screen } from '@testing-library/react';

test('shows warning when balance is low', () => {
  render(
    <useAccountStore.MockContext state={{ balance: 5, currency: 'USD' }}>
      <AccountStatus />
    </useAccountStore.MockContext>,
  );

  expect(screen.getByText('Low balance warning')).toBeInTheDocument();
});

test('shows normal status when balance is healthy', () => {
  render(
    <useAccountStore.MockContext state={{ balance: 1000, currency: 'USD' }}>
      <AccountStatus />
    </useAccountStore.MockContext>,
  );

  expect(screen.queryByText('Low balance warning')).not.toBeInTheDocument();
});
```

No mocking libraries. No global state cleanup. Just render with the state you need.

### Dynamic Initial State with Context Value

Pass a `value` prop to Context to provide data for `getInitialState()`. This is useful when you need to initialize store state from React props:

```tsx
type CounterState = { count: number };

class CounterStore extends Store<CounterState> {
  protected getInitialState(contextValue?: Partial<CounterState>) {
    return { count: contextValue?.count ?? 0 };
  }

  increment() {
    this.setState((s) => ({ count: s.count + 1 }));
  }
}

const useCounterStore = createStoreHook(CounterStore);

// Initialize store state from a React prop
function CounterWidget({ initialCount }: { initialCount: number }) {
  return (
    <useCounterStore.Context value={{ count: initialCount }}>
      <Counter />
    </useCounterStore.Context>
  );
}

// Now you can render multiple widgets with different starting values
function App() {
  return (
    <>
      <CounterWidget initialCount={0} />
      <CounterWidget initialCount={100} />
    </>
  );
}
```

## Why context-scoped-state Over Other Libraries?

| Feature                | context-scoped-state | Redux                        | Zustand        |
| ---------------------- | -------------------- | ---------------------------- | -------------- |
| **Scoped by default**  | Yes                  | No                           | No             |
| **Multiple instances** | Automatic            | Manual wiring                | Manual wiring  |
| **Test isolation**     | Built-in MockContext | Requires setup               | Requires reset |
| **Boilerplate**        | Low                  | High                         | Low            |
| **Type safety**        | Full                 | Requires setup               | Good           |
| **Learning curve**     | Just classes         | Actions, reducers, selectors | Simple         |

### The Core Difference

**Global state libraries** make you fight against React's component model. You end up with:

- Selector functions to prevent re-renders
- Complex test fixtures to reset global state
- Workarounds for component reusability

**context-scoped-state** works _with_ React:

- State lives in the component tree, just like React intended
- Each provider = new instance, automatically
- Testing is just rendering with different props

### When to Use What

**Use context-scoped-state when:**

- Building reusable components with internal state
- You want test isolation without extra setup
- State naturally belongs to a subtree, not the whole app

**Need global state?** Just place the Context at your app root — same API, app-wide access.

### Why Not Just Use useState or useReducer?

**vs useState:**

- `useState` binds state directly to the component — poor separation of concerns and hard to test since you can't easily set a component to a specific state
- Lifting state up with `useState` requires refactoring components and passing props; with `context-scoped-state`, just move the Context wrapper up the tree

**vs useReducer:**

- No action types, switch statements, or dispatch boilerplate
- Just call methods directly: `store.increment()` instead of `dispatch({ type: 'INCREMENT' })`
- Full TypeScript autocomplete for your actions

---

## API Design Choices

These design decisions are intentional trade-offs that optimize for debuggability, clarity, and simplicity.

### Why Classes for Stores?

Classes let us use `protected` on state-setting methods (`setState`, `patchState`). This means all state updates must go through the store class — components cannot directly modify state.

**Why this matters:** When debugging, you can set a single breakpoint in your store's action methods to see exactly who is changing state and when. No more hunting through components to find where state got mutated.

```tsx
class CounterStore extends Store<{ count: number }> {
  increment() {
    // Set a breakpoint here to catch ALL count changes
    this.setState((state) => ({ count: state.count + 1 }));
  }
}
```

### Why Can't I Destructure Actions?

This won't work:

```tsx
const { increment } = useCounterStore(); // ❌ Breaks 'this' binding
increment(); // Error: cannot read setState of undefined
```

You must use:

```tsx
const store = useCounterStore(); // ✅
store.increment();
```

**This is a feature, not a bug.** The store is an external dependency — it should look like one. When you see `store.increment()`, it's clear you're calling a method on an external object. If you just saw `increment()`, it would look like a local function, hiding the fact that it's modifying external state.

### Why `useStore.Context` Instead of Separate Exports?

Instead of:

```tsx
// Two exports to manage
export const useCounterStore = createStoreHook(CounterStore);
export const CounterStoreContext = useCounterStore.Context;
```

We have:

```tsx
// One export does it all
export const useCounterStore = createStoreHook(CounterStore);

// Usage
<useCounterStore.Context>
  <App />
</useCounterStore.Context>;
```

**Simplicity:** One export per store file. The hook and its context travel together — you can't accidentally import one without having access to the other.

### Context `value` vs MockContext `state`

Both `Context` and `MockContext` accept props, but they work differently:

```tsx
// Context: value is passed TO getInitialState() for computation
<useCounterStore.Context value={{ count: 10 }}>

// MockContext: state REPLACES getInitialState() entirely
<useCounterStore.MockContext state={{ count: 10 }}>
```

**Why the distinction?**

- `Context.value` — Provides input data for `getInitialState()` to use. Your `getInitialState()` method is still the single source of truth for how state is computed.
- `MockContext.state` — Bypasses `getInitialState()` completely and sets the state directly. This is only for tests where you need to put the store in a specific state.

**Debuggability:** In production code, `getInitialState()` is always called. You can set a breakpoint there to see exactly how initial state is computed. With `MockContext`, the state is set directly for test convenience.

### Why `getInitialState()` Method Instead of a Property?

Instead of:

```tsx
class CounterStore extends Store<{ count: number }> {
  initialState = { count: 0 }; // Static value
}
```

We use:

```tsx
class CounterStore extends Store<{ count: number }> {
  protected getInitialState() {
    // Can include logic!
    return { count: 0 };
  }
}
```

**Flexibility:** A method lets you compute initial state dynamically:

```tsx
protected getInitialState() {
  return {
    count: parseInt(localStorage.getItem('count') ?? '0'),
    timestamp: Date.now(),
  };
}
```

---

**context-scoped-state** — Because not all state needs to be global.
