import * as Products from "@reducers/products";
import * as People from "@reducers/people";
import * as Transaction from "@reducers/transaction";
import * as Cart from "@reducers/cart";
import * as Stock from "@reducers/stock";

export interface ApplicationState {
  products: Products.ProductsState; 
  people: People.PeopleState;      
  transaction: Transaction.TransactionsState;
  cart: Cart.CartState;
  stock: Stock.StockState;
}

export const reducers = {
  products: Products.reducer || undefined, 
  people: People.reducer || undefined, 
  transaction: Transaction.reducer || undefined,
  cart: Cart.reducer || undefined,
  stock: Stock.reducer || undefined,
};

export interface AppThunkAction<TAction> {
  (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
