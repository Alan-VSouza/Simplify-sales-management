export interface TransactionsState {
  getAllStatus: "loading" | "idle" | "failure";
  transactions: ITransaction[];
}

export interface ITransaction {
  id: number;
  transactionAt: Date;
  personId: number;
  person: IPerson;
  type: TransactionType;
  totalValue: number;
  totalDiscount: number;
  finalValue: number;
  paymentMethod: PaymentMethod;
  transactionsItems: ITransactionItem[];
  active: boolean;
  createAt: Date;
  updateAt: Date;
}

export interface ITransactionItem {
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  unitValue: number;
  totalValue: number;
}

export interface IPerson {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  document: string;
  type: number;
}

export enum TransactionType {
  Buy = 0,
  Sell = 1,
}

export enum PaymentMethod {
  CreditCard = 0,
  DebitCard = 1,
  Money = 2,
  Pix = 3,
}

export interface RequestGetAllAction {
  type: "TRANSACTION_REQUEST_GETALL";
}

export interface ReceiveGetAllAction {
  type: "TRANSACTION_RECEIVE_GETALL";
  data: ITransaction[];
}

export interface FailureGetAllAction {
  type: "TRANSACTION_FAIL_GETALL";
}

export interface RequestAddAction {
  type: "TRANSACTION_REQUEST_ADD";
}

export interface ReceiveAddAction {
  type: "TRANSACTION_RECEIVE_ADD";
  data: ITransaction;
}

export interface FailureAddAction {
  type: "TRANSACTION_FAIL_ADD";
}

export interface RequestEditAction {
  type: "TRANSACTION_REQUEST_EDIT";
}

export interface ReceiveEditAction {
  type: "TRANSACTION_RECEIVE_EDIT";
  data: ITransaction;
}

export interface FailureEditAction {
  type: "TRANSACTION_FAIL_EDIT";
}

export interface RequestDeleteAction {
  type: "TRANSACTION_REQUEST_DELETE";
}

export interface ReceiveDeleteAction {
  type: "TRANSACTION_RECEIVE_DELETE";
  id: number;
}

export interface FailureDeleteAction {
  type: "TRANSACTION_FAIL_DELETE";
}

export type KnownAction = RequestGetAllAction | ReceiveGetAllAction | FailureGetAllAction | RequestAddAction | ReceiveAddAction
  | FailureAddAction | RequestEditAction | ReceiveEditAction | FailureEditAction | RequestDeleteAction | ReceiveDeleteAction 
  | FailureDeleteAction;
