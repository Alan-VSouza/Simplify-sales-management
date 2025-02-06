import { Action, Reducer } from "redux";
import { KnownAction, PeopleState } from "./interface";

const unloadedState: PeopleState = { getAllStatus: "idle", people: [] };

export const reducer: Reducer<PeopleState | undefined> = (
  state: PeopleState | undefined,
  incomingAction: Action
) => {
  if (state == undefined) {
    return unloadedState;
  }
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "PEOPLE_REQUEST_GETALL":
    case "PEOPLE_REQUEST_ADD":
    case "PEOPLE_REQUEST_EDIT":
    case "PEOPLE_REQUEST_DELETE":
      return {
        ...state,
        getAllStatus: "loading",
      };
    case "PEOPLE_RECEIVE_GETALL":
      return {
        ...state,
        getAllStatus: "idle",
        people: action.data,
      };
    case "PEOPLE_RECEIVE_ADD":
      return {
        ...state,
        getAllStatus: "idle",
        people: [...state.people, action.data],
      };
    case "PEOPLE_RECEIVE_EDIT":
      return {
        ...state,
        getAllStatus: "idle",
        people: state.people.map((person) =>
          person.id === action.data.id ? action.data : person
        ),
      };
    case "PEOPLE_RECEIVE_DELETE":
      return {
        ...state,
        getAllStatus: "idle",
        people: state.people.filter((person) => person.id !== action.id),
      };
    case "PEOPLE_FAIL_GETALL":
    case "PEOPLE_FAIL_ADD":
    case "PEOPLE_FAIL_EDIT":
    case "PEOPLE_FAIL_DELETE":
      return {
        ...state,
        getAllStatus: "failure",
      };
    default:
      return state;
  }
};
