export interface StateConnector<State, Bindings = undefined> {
  readonly getState: () => State;
  readonly setState: (update: (state: State) => State) => void;
  readonly bindings: Bindings;
  readonly isActive: () => boolean;
}

export interface StatefulService<State, Actions, Bindings = undefined> {
  readonly createInitialState: (bindings: Bindings) => State;
  readonly connect: (connector: StateConnector<State, Bindings>) => Actions;
}

export interface StatefulConnection<State, Actions> {
  readonly state: State;
  readonly actions: Actions;
}
