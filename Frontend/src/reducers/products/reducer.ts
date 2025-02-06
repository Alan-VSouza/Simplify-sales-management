import { Action, Reducer } from "redux";
import { KnownAction, ProductsState } from "./interface";

const unloadedState: ProductsState = { getAllStatus: "idle", products: [] };

export const reducer: Reducer<ProductsState | undefined> = (
  state: ProductsState | undefined,
  incomingAction: Action
) => {
  if (state == undefined) {
    return unloadedState;
  }
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "PRODUCT_REQUEST_GETALL":
    case "PRODUCT_REQUEST_ADD":
    case "PRODUCT_REQUEST_EDIT":
    case "PRODUCT_REQUEST_DELETE":
      return {
        ...state,
        getAllStatus: "loading",
      };
    case "PRODUCT_RECEIVE_GETALL":
      return {
        ...state,
        getAllStatus: "idle",
        products: action.data,
      };
    case "PRODUCT_RECEIVE_ADD":
      return {
        ...state,
        getAllStatus: "idle",
        products: [...state.products, action.data],
      };
    case "PRODUCT_RECEIVE_EDIT":
      return {
        ...state,
        getAllStatus: "idle",
        products: state.products.map((product) =>
          product.id === action.data.id ? action.data : product
        ),
      };
    case "PRODUCT_RECEIVE_DELETE":
      return {
        ...state,
        getAllStatus: "idle",
        products: state.products.filter((product) => product.id !== action.id),
      };
    case "PRODUCT_FAIL_GETALL":
    case "PRODUCT_FAIL_ADD":
    case "PRODUCT_FAIL_EDIT":
    case "PRODUCT_FAIL_DELETE":
      return {
        ...state,
        getAllStatus: "failure",
      };
    default:
      return state;
  }
};
