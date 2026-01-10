import React from "react";
import type { Store } from "./Store";

function createStoreHook<U, T extends Store<U>>(storeClass: new () => T) {
  const StoreContext = React.createContext<T | undefined>(undefined);

  function useStore(): T {
    const contextValue = React.useContext(StoreContext);

    if (!contextValue) {
      throw new Error("useStore must be used within a StoreContext");
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
