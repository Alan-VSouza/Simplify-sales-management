export interface ICartProduct {
  id: number;
  name: string;
  type: string;
  category: string;
  brand: string;
  salesValue: number;
  quantity: number;
  discount?: number; 
}

export interface CartState {
  cartItems: ICartProduct[];
}

export interface AddToCartAction {
  type: "CART_ADD_PRODUCT";
  data: ICartProduct;
}

export interface UpdateQuantityAction {
  type: "CART_UPDATE_QUANTITY";
  id: number;
  quantity: number;
}

export interface UpdateDiscountAction {
  type: "CART_UPDATE_DISCOUNT";
  id: number;
  discount: number;
}

export interface RemoveFromCartAction {
  type: "CART_REMOVE_PRODUCT";
  id: number;
}

export interface ClearCartAction {
  type: "CART_CLEAR";
}

export type KnownAction =
  | AddToCartAction
  | UpdateQuantityAction
  | UpdateDiscountAction
  | RemoveFromCartAction
  | ClearCartAction;
