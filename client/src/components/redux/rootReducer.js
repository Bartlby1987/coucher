import {combineReducers} from "redux";
import {gamesReducer} from "./postsReducer";

export const rootReducer = combineReducers({
    games: gamesReducer
})