export interface ProductsState {
    getAllStatus: "loading" | "idle" | "failure";
    products: IProduct[];
  }
  
  export interface IProduct {
    id: number;
    name: string;
    type: string;
    category: string;
    brand: string;
    quantity: number;
    salesValue: number;
    active: boolean;
    createAt: Date;
    updateAt: Date;
  }
  
  
  export interface RequestGetAllAction {
    type: "PRODUCT_REQUEST_GETALL";
  }
  
  export interface ReceiveGetAllAction {
    type: "PRODUCT_RECEIVE_GETALL";
    data: IProduct[];
  }
  
  export interface FailureGetAllAction {
    type: "PRODUCT_FAIL_GETALL";
  }
  
  export interface RequestDeleteAction {
    type: "PRODUCT_REQUEST_DELETE";
  }
  
  export interface ReceiveDeleteAction {
    type: "PRODUCT_RECEIVE_DELETE";
    id: number;
  }
  
  export interface FailureDeleteAction {
    type: "PRODUCT_FAIL_DELETE";
  }
  
  export interface RequestAddAction {
    type: "PRODUCT_REQUEST_ADD";
  }
  
  export interface ReceiveAddAction {
    type: "PRODUCT_RECEIVE_ADD";
    data: IProduct;
  }
  
  export interface FailureAddAction {
    type: "PRODUCT_FAIL_ADD";
  }
  
  export interface RequestEditAction {
    type: "PRODUCT_REQUEST_EDIT";
  }
  
  export interface ReceiveEditAction {
    type: "PRODUCT_RECEIVE_EDIT";
    data: IProduct;
  }
  
  export interface FailureEditAction {
    type: "PRODUCT_FAIL_EDIT";
  }
  
  export type KnownAction = RequestGetAllAction | ReceiveGetAllAction | FailureGetAllAction | RequestDeleteAction | ReceiveDeleteAction
    | FailureDeleteAction | RequestAddAction | ReceiveAddAction | FailureAddAction | RequestEditAction | ReceiveEditAction | FailureEditAction;
  
  