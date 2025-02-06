import { AppThunkAction } from "@store/index";
import { ITransaction, KnownAction } from "./interface";
import { toast } from "react-toastify";

export const actionsCreators = {
  GetAll: (force: boolean = false): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const state = getState();
    if (state && (state.transaction.transactions.length === 0 || force)) {
      dispatch({ type: "TRANSACTION_REQUEST_GETALL" });

      fetch('https://localhost:7159/api/Transaction')
        .then((response) => response.json())
        .then((data: ITransaction[]) => {
          dispatch({ type: "TRANSACTION_RECEIVE_GETALL", data });
        })
        .catch(() => {
          dispatch({ type: "TRANSACTION_FAIL_GETALL" });
        });
    }
  },

  Add: (transaction: ITransaction): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "TRANSACTION_REQUEST_ADD" });

    fetch('https://localhost:7159/api/Transaction', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao adicionar transação");
        }
        return response.json();
      })
      .then((newTransaction: ITransaction) => {
        dispatch({ type: "TRANSACTION_RECEIVE_ADD", data: newTransaction });
      })
      .catch(() => {
        dispatch({ type: "TRANSACTION_FAIL_ADD" });
      });
  },

  Edit: (transaction: ITransaction): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "TRANSACTION_REQUEST_EDIT" });

    fetch(`https://localhost:7159/api/Transaction/${transaction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao editar transação");
        }
        return response.json();
      })
      .then((updatedTransaction: ITransaction) => {
        dispatch({ type: "TRANSACTION_RECEIVE_EDIT", data: updatedTransaction });
      })
      .catch(() => {
        dispatch({ type: "TRANSACTION_FAIL_EDIT" });
      });
  },

  Delete: (id: number): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "TRANSACTION_REQUEST_DELETE" });

    fetch(`https://localhost:7159/api/Transaction/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao deletar transação");
        }
        dispatch({ type: "TRANSACTION_RECEIVE_DELETE", id });
      })
      .catch(() => {
        dispatch({ type: "TRANSACTION_FAIL_DELETE" });
      });
  },

  ToggleStatus: (id: number, active: boolean): AppThunkAction<KnownAction> => async (dispatch) => {
    dispatch({ type: "TRANSACTION_REQUEST_EDIT" });
  
    try {
      const response = await fetch(`https://localhost:7159/api/Transaction/toggle-status/${id}`, {
        method: "PUT",
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.Error || "Erro ao alternar o status.");
      }
  
      const updatedTransaction: ITransaction = await response.json();
      dispatch({ type: "TRANSACTION_RECEIVE_EDIT", data: updatedTransaction });
      dispatch(actionsCreators.GetAll(true));
    } catch (error: any) {
      console.error(`Erro ao alternar o status da transação ${id}:`, error.message);
      toast.error(`Erro ao alternar status: ${error.message}`, { position: "top-right", autoClose: 3000 });
    }
  },
  
}  
