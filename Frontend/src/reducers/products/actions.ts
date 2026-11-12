import { AppThunkAction } from "@store/index";
import { IProduct, KnownAction } from "./interface";
import { API_URL } from "../../config/api";

/** Dates are set by the API, so they are not sent when creating or editing. */
export type ProductPayload = Omit<IProduct, "createAt" | "updateAt">;

export const actionsCreators = {
  GetAll: (force: boolean = false): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const state = getState();
    if (state && (state.products.products.length === 0 || force)) {
      dispatch({ type: "PRODUCT_REQUEST_GETALL" });

      fetch(`${API_URL}/api/Product`)
        .then((response) => response.json())
        .then((data: IProduct[]) => {
          dispatch({ type: "PRODUCT_RECEIVE_GETALL", data });
        })
        .catch(() => {
          dispatch({ type: "PRODUCT_FAIL_GETALL" });
        });
    }
  },

  Delete: (id: number): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "PRODUCT_REQUEST_DELETE" });

    fetch(`${API_URL}/api/Product/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao deletar produto");
        }
        dispatch({ type: "PRODUCT_RECEIVE_DELETE", id });
      })
      .catch(() => {
        dispatch({ type: "PRODUCT_FAIL_DELETE" });
      });
  },

  Add: (product: ProductPayload): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "PRODUCT_REQUEST_ADD" });

    fetch(`${API_URL}/api/Product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao adicionar produto");
        }
        return response.json();
      })
      .then((newProduct: IProduct) => {
        dispatch({ type: "PRODUCT_RECEIVE_ADD", data: newProduct });
      })
      .catch(() => {
        dispatch({ type: "PRODUCT_FAIL_ADD" });
      });
  },

  Edit: (product: ProductPayload): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "PRODUCT_REQUEST_EDIT" });

    fetch(`${API_URL}/api/Product/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao editar produto");
        }
        return response.json();
      })
      .then((updatedProduct: IProduct) => {
        dispatch({ type: "PRODUCT_RECEIVE_EDIT", data: updatedProduct });
      })
      .catch(() => {
        dispatch({ type: "PRODUCT_FAIL_EDIT" });
      });
  },
};
