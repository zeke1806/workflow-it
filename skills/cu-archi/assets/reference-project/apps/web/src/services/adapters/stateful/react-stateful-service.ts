import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StatefulConnection, StatefulService } from "./stateful-types";

export function useStatefulService<State, Actions>(
  service: StatefulService<State, Actions>,
): StatefulConnection<State, Actions>;

export function useStatefulService<State, Actions, Bindings>(
  service: StatefulService<State, Actions, Bindings>,
  bindings: Bindings,
): StatefulConnection<State, Actions>;

export function useStatefulService<State, Actions, Bindings>(
  service: StatefulService<State, Actions, Bindings>,
  bindings?: Bindings,
): StatefulConnection<State, Actions> {
  // The same bindings source initializes the state and connects the actions.
  const [state, setState] = useState(() => service.createInitialState(bindings as Bindings));
  const stateRef = useRef(state);
  const bindingsRef = useRef(bindings);
  const mounted = useRef(false);

  const [actions] = useState(() =>
    service.connect({
      isActive: () => {
        return mounted.current;
      },

      getState: () => {
        return stateRef.current;
      },

      setState: (update) => {
        if (!mounted.current) {
          return;
        }

        const nextState = update(stateRef.current);
        stateRef.current = nextState;
        setState(() => nextState);
      },

      get bindings() {
        // The overloads require bindings unless the service's contract uses undefined.
        return bindingsRef.current as Bindings;
      },
    }),
  );

  useLayoutEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return { state, actions };
}

/** Raccordement du cycle React aux actions du service, sans decision applicative. */
export function useServiceLifecycle(start: () => void | Promise<void>, stop: () => void) {
  useEffect(() => {
    void start();

    return stop;
  }, [start, stop]);
}
