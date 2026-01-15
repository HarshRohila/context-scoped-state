<div align="center">
  <img src="./packages/context-store-react/logo.svg" alt="context-scoped-state logo" width="120" height="120">
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

```tsx
// counterStore.ts
import { Store, createStoreHook } from 'context-scoped-state';

class CounterStore extends Store<{ count: number }> {
  protected getInitialState() {
    return { count: 0 };
  }

  increment() {
    // Callback-based: receives current state, returns new state
    this.setState(state => ({ count: state.count + 1 }));
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
    this.patchState(state => ({ age: state.age + 1 }));
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

**context-scoped-state** — Because not all state needs to be global.
