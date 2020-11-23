import {combineReducers} from "redux";
import {gamesReducer} from "./gamesReducer";
import {appReducer} from "./appReducer";

export const rootReducer = combineReducers({
    games: gamesReducer,
    app: appReducer
})