import { KnownAction } from "@reducers/people/interface";
import { AppThunkAction } from "@store/index";
import { IPerson } from "./interface";
import { API_URL } from "../../config/api";

export const actionsCreators = {
  GetAll: (force: boolean = false): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const state = getState();
    if (state && (state.people.people.length === 0 || force)) {
      dispatch({ type: "PEOPLE_REQUEST_GETALL" });

      fetch(`${API_URL}/api/People`)
        .then((response) => response.json())
        .then((data: IPerson[]) => {
          dispatch({ type: "PEOPLE_RECEIVE_GETALL", data });
        })
        .catch(() => {
          dispatch({ type: "PEOPLE_FAIL_GETALL" });
        });
    }
  },

  Delete: (id: number): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "PEOPLE_REQUEST_DELETE" });

    fetch(`${API_URL}/api/People/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao deletar pessoa");
        }
        dispatch({ type: "PEOPLE_RECEIVE_DELETE", id });
      })
      .catch(() => {
        dispatch({ type: "PEOPLE_FAIL_DELETE" });
      });
  },

  Add: (person: IPerson): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "PEOPLE_REQUEST_ADD" });

    fetch(`${API_URL}/api/People`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao adicionar pessoa");
        }
        return response.json();
      })
      .then((newPerson: IPerson) => {
        dispatch({ type: "PEOPLE_RECEIVE_ADD", data: newPerson });
      })
      .catch(() => {
        dispatch({ type: "PEOPLE_FAIL_ADD" });
      });
  },

  Edit: (person: IPerson): AppThunkAction<KnownAction> => (dispatch) => {
    dispatch({ type: "PEOPLE_REQUEST_EDIT" });

    fetch(`${API_URL}/api/People/${person.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao editar pessoa");
        }
        return response.json();
      })
      .then((updatedPerson: IPerson) => {
        dispatch({ type: "PEOPLE_RECEIVE_EDIT", data: updatedPerson });
      })
      .catch(() => {
        dispatch({ type: "PEOPLE_FAIL_EDIT" });
      });
  },
};
