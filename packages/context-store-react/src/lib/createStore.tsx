import React, { useSyncExternalStore } from 'react';
import type { Store } from './Store';

function createStoreHook<T extends Store<any>>(storeClass: new () => T) {
  type StateType = ReturnType<T['getState']>;
  // Internal type with mutable state for internal assignment
  type TWithMutableState = T & { state: StateType };
  // Public type with readonly state for consumers
  type TWithState = T & { readonly state: StateType };

  // Extend user's class to add state property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StoreWithState = class extends (storeClass as any) {
    public state!: StateType;
  } as new () => TWithMutableState;

  const StoreContext = React.createContext<TWithMutableState | undefined>(
    undefined,
  );

  function useStore(): TWithState {
    const contextValue = React.useContext(StoreContext);

    if (!contextValue) {
      throw new Error(
        `Store hook used outside of its Context provider.\n\n` +
          `If you created your hook like:\n` +
          `  const useYourStore = createStoreHook(${storeClass.name});\n\n` +
          `Then wrap your component with:\n` +
          `  <useYourStore.Context>\n` +
          `    <YourComponent />\n` +
          `  </useYourStore.Context>`,
      );
    }

    const subscribe = React.useCallback(
      (onStoreChange: () => void) => {
        const subscription = contextValue.state$().subscribe(onStoreChange);
        return () => subscription.unsubscribe();
      },
      [contextValue],
    );

    const state = useSyncExternalStore(
      subscribe,
      () => contextValue.getState(),
      () => contextValue.getState(), // getServerSnapshot for SSR
    );

    contextValue.state = state;

    return contextValue;
  }

  useStore.Context = function ContextComponent({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const [store] = React.useState(() => new StoreWithState());

    return (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
  };

  useStore.MockContext = function MockContextComponent({
    children,
    state,
  }: {
    children: React.ReactNode;
    state?: StateType;
  }) {
    const createMockStore = (): TWithMutableState => {
      if (state === undefined) {
        return new StoreWithState();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MockStore = class extends (StoreWithState as any) {
        protected getInitialState() {
          return state;
        }
      } as unknown as new () => TWithMutableState;
      return new MockStore();
    };

    const storeRef = React.useRef(createMockStore());

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  };

  return useStore;
}
export { createStoreHook };
