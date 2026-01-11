import { BehaviorSubject } from 'rxjs';

abstract class Store<T> {
  protected abstract getInitialState(): T;

  private readonly _stateSubject: BehaviorSubject<T>;

  constructor() {
    this.state = this.getInitialState();
    this._stateSubject = new BehaviorSubject(this.getInitialState());
  }

  getState(): T {
    return this._stateSubject.value;
  }

  state$() {
    return this._stateSubject.asObservable();
  }

  public state: T;

  protected setState(newState: T): void {
    this._stateSubject.next(newState);
  }
}

export { Store };
