import { useDispatch } from "react-redux";
import type { AppDispatch } from "@store/index";

/** Typed useDispatch that accepts the app's thunks. */
export const useAppDispatch = () => useDispatch() as unknown as AppDispatch;
