// base type for our Redux actions
export interface Action<TypeT, PayloadT> {
  type: TypeT;
  payload: PayloadT;
}

// dangerous >:)
export type AnyAction = Action<any, any>

interface ActionModule<TypeT, PayloadT> {
  // action creator
  (payload: PayloadT): Action<TypeT, PayloadT>;
  // type assertion. provides type safety inside a reducer
  match(action: AnyAction): action is Action<TypeT, PayloadT>;
  // string constant of the type
  T: TypeT;
}

// ActionModule constructor
export function makeAction<TypeT, PayloadT>
  (typestring: TypeT): ActionModule<TypeT, PayloadT> {
    const m = <ActionModule<TypeT, PayloadT>>
      function(payload: PayloadT): Action<TypeT, PayloadT> {
      return {
        type: typestring,
        payload: payload
      };
    }

    m.T = typestring;
    m.match = function(action: AnyAction): action is Action<TypeT, PayloadT> {
      return action.type === typestring;
    }
    return m;
  }
