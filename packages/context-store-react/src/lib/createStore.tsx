import React from 'react';
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

    const [state, setState] = React.useState(contextValue.getState());

    React.useEffect(() => {
      const subscription = contextValue.state$().subscribe(setState);
      return () => subscription.unsubscribe();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    contextValue.state = state;

    return contextValue;
  }

  useStore.Context = function ContextComponent({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const storeClassRef = React.useRef(new storeClass());

    return (
      <StoreContext value={storeClassRef.current}>{children}</StoreContext>
    );
  };

  return useStore;
}
export { createStoreHook };
