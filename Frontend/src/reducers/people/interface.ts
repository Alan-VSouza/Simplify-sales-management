export interface PeopleState {
  getAllStatus: "loading" | "idle" | "failure";
  people: IPerson[];
}

export interface IPerson {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  document: string;
  type: number; 
}

export interface RequestGetAllAction {
  type: "PEOPLE_REQUEST_GETALL";
}

export interface ReceiveGetAllAction {
  type: "PEOPLE_RECEIVE_GETALL";
  data: IPerson[];
}

export interface FailureGetAllAction {
  type: "PEOPLE_FAIL_GETALL";
}

export interface RequestDeleteAction {
  type: "PEOPLE_REQUEST_DELETE";
}

export interface ReceiveDeleteAction {
  type: "PEOPLE_RECEIVE_DELETE";
  id: number;
}

export interface FailureDeleteAction {
  type: "PEOPLE_FAIL_DELETE";
}

export interface RequestAddAction {
  type: "PEOPLE_REQUEST_ADD";
}

export interface ReceiveAddAction {
  type: "PEOPLE_RECEIVE_ADD";
  data: IPerson;
}

export interface FailureAddAction {
  type: "PEOPLE_FAIL_ADD";
}

export interface RequestEditAction {
  type: "PEOPLE_REQUEST_EDIT";
}

export interface ReceiveEditAction {
  type: "PEOPLE_RECEIVE_EDIT";
  data: IPerson;
}

export interface FailureEditAction {
  type: "PEOPLE_FAIL_EDIT";
}

export type KnownAction =
  | RequestGetAllAction
  | ReceiveGetAllAction
  | FailureGetAllAction
  | RequestDeleteAction
  | ReceiveDeleteAction
  | FailureDeleteAction
  | RequestAddAction
  | ReceiveAddAction
  | FailureAddAction
  | RequestEditAction
  | ReceiveEditAction
  | FailureEditAction;
