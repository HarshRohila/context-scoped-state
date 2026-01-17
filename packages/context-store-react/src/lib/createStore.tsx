import React, { useSyncExternalStore } from 'react';
import type { Store } from './Store';

function createStoreHook<T extends Store<any>>(storeClass: new () => T) {
  const StoreContext = React.createContext<T | undefined>(undefined);

  function useStore(): T {
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
    const [store] = React.useState(() => new storeClass());

    return (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
  };

  useStore.MockContext = function MockContextComponent({
    children,
    state,
  }: {
    children: React.ReactNode;
    state?: ReturnType<T['getState']>;
  }) {
    const createMockStore = (): T => {
      if (state === undefined) {
        return new storeClass();
      }
      class MockStore extends (storeClass as new () => Store<unknown>) {
        protected getInitialState() {
          return state;
        }
      }
      return new MockStore() as unknown as T;
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
