import {GET_GAMES} from "./types";

const initialState = {
    games: [],
}

export const gamesReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_GAMES:
            return {...state, games: action.payload}
        default:
            return state
    }
}