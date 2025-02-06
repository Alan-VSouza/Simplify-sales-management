import { Action, Reducer } from "redux";
import { CartState, KnownAction } from "./interface";

const unloadedState: CartState = {
  cartItems: [],
};

export const cartReducer: Reducer<CartState | undefined> = (
  state: CartState | undefined,
  incomingAction: Action
) => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "CART_ADD_PRODUCT":
      return {
        ...state,
        cartItems: [...state.cartItems, action.data],
      };

    case "CART_UPDATE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.id === action.id ? { ...item, quantity: action.quantity } : item
        ),
      };

    case "CART_UPDATE_DISCOUNT":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.id === action.id ? { ...item, discount: action.discount } : item
        ),
      };

    case "CART_REMOVE_PRODUCT":
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item.id !== action.id),
      };

    case "CART_CLEAR":
      return {
        ...state,
        cartItems: [],
      };

    default:
      return state;
  }
};

export * from "./interface";
