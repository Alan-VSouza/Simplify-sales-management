import { Action, Reducer } from "redux";
import { StockState, KnownAction } from "./interface";

const unloadedState: StockState = {
  stockItems: [],
};

export const stockReducer: Reducer<StockState | undefined> = (
  state: StockState | undefined,
  incomingAction: Action
) => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "STOCK_GET_ALL":
      return {
        ...state,
        stockItems: action.data,
      };

    case "STOCK_UPDATE_PRODUCT":
      return {
        ...state,
        stockItems: state.stockItems.map((item) =>
        item.id === action.id ? action.product : item
        ),
      };
      
    case "STOCK_DELETE_PRODUCT":
      return {
        ...state,
        stockItems: state.stockItems.filter((item) => item.id !== action.id),
      };
    
    default:
      return state;
      
  }
  
};

export * from "./interface";
