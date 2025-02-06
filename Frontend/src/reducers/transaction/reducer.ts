import { KnownAction } from "./interface";
import { Action, Reducer } from "redux";
import { TransactionsState } from "./interface";

const unloadedState: TransactionsState = { getAllStatus: "idle", transactions: [] };

export const reducer: Reducer<TransactionsState | undefined> = (
  state: TransactionsState | undefined,
  incomingAction: Action
) => {
  if (state === undefined) {
    return unloadedState;
  }
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "TRANSACTION_REQUEST_GETALL":
    case "TRANSACTION_REQUEST_ADD":
    case "TRANSACTION_REQUEST_EDIT":
    case "TRANSACTION_REQUEST_DELETE":
      return {
        ...state,
        getAllStatus: "loading",
      };
    case "TRANSACTION_RECEIVE_GETALL":
      return {
        ...state,
        getAllStatus: "idle",
        transactions: action.data,
      };
    case "TRANSACTION_RECEIVE_ADD":
      return {
        ...state,
        getAllStatus: "idle",
        transactions: [...state.transactions, action.data],
      };
    case "TRANSACTION_RECEIVE_EDIT":
      return {
        ...state,
        getAllStatus: "idle",
        transactions: state.transactions.map((transaction) =>
        transaction.id === action.data.id ? action.data : transaction
        ),
      };
    case "TRANSACTION_RECEIVE_DELETE":
      return {
        ...state,
        getAllStatus: "idle",
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.id
        ),
      };
    case "TRANSACTION_FAIL_GETALL":
    case "TRANSACTION_FAIL_ADD":
    case "TRANSACTION_FAIL_EDIT":
    case "TRANSACTION_FAIL_DELETE":
      return {
        ...state,
        getAllStatus: "failure",
      };
    default:
      return state;
  }
};
