import { AppThunkAction } from "@store/index";
import { ICartProduct, KnownAction } from "./interface";

export const actionsCreators = {
  AddToCart: (product: ICartProduct): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const state = getState();
    const existingProduct = state.cart.cartItems.find((item) => item.id === product.id);
  
    if (existingProduct) {
      dispatch({
        type: "CART_UPDATE_QUANTITY",
        id: product.id,
        quantity: existingProduct.quantity + product.quantity,
      });
    } else {
      dispatch({
        type: "CART_ADD_PRODUCT",
        data: { ...product, quantity: product.quantity, discount: 0 }, 
      });
    }
  },
  

  UpdateQuantity: (id: number, quantity: number): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({
      type: "CART_UPDATE_QUANTITY",
      id,
      quantity,
    });
  },

  UpdateDiscount: (id: number, discount: number): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({
      type: "CART_UPDATE_DISCOUNT",
      id,
      discount,
    });
  },

  RemoveFromCart: (id: number): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({
      type: "CART_REMOVE_PRODUCT",
      id,
    });
  },

  ClearCart: (): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({
      type: "CART_CLEAR",
    });
  },
};
