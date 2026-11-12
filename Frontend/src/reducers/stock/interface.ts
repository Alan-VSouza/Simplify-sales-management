export interface StockState {
  stockItems: IStockProduct[];
}

export interface IStockProduct {
  id: number;
  name: string;
  type: string;
  category: string;
  brand: string;
  quantity: number;
  factoryValue: number;
  salesValue: number;
}

export interface GetAllStockAction {
  type: "STOCK_GET_ALL";
  data: IStockProduct[];
}

export interface UpdateStockAction {
  type: "STOCK_UPDATE_PRODUCT";
  id: number;
  /** New quantity (after adding stock). */
  quantity?: number;
  /** Full updated product (after editing). */
  product?: IStockProduct;
}

export interface DeleteStockProductAction {
  type: "STOCK_DELETE_PRODUCT";
  id: number;
}

export type KnownAction = 
  | GetAllStockAction 
  | UpdateStockAction 
  | DeleteStockProductAction;
