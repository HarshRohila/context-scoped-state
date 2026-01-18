import { BehaviorSubject } from 'rxjs';

abstract class Store<T, C = Partial<T>> {
  protected abstract getInitialState(contextValue?: C): T;

  private readonly _stateSubject: BehaviorSubject<T>;

  constructor(contextValue?: C) {
    this._stateSubject = new BehaviorSubject(
      this.getInitialState(contextValue),
    );
  }

  getState(): T {
    return this._stateSubject.value;
  }

  state$() {
    return this._stateSubject.asObservable();
  }

  protected setState(newState: T | ((currentState: T) => T)): void {
    const nextState =
      typeof newState === 'function'
        ? (newState as (currentState: T) => T)(this._stateSubject.value)
        : newState;
    this._stateSubject.next(nextState);
  }

  protected patchState(
    partialState: Partial<T> | ((currentState: T) => Partial<T>),
  ): void {
    const currentState = this._stateSubject.value;
    const partial =
      typeof partialState === 'function'
        ? (partialState as (currentState: T) => Partial<T>)(currentState)
        : partialState;
    this._stateSubject.next({ ...currentState, ...partial });
  }
}

export { Store };
