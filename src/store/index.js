import { combineReducers, createStore } from "redux";
import globalReducer from "./GlobalStore";

const rootReducer = combineReducers({
    global: globalReducer
});
const rootStore = createStore(rootReducer);
export default rootStore;