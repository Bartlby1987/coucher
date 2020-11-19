import { GAMES_LOADED} from "./types";

const initialState = {
    games: [],
}

export const gamesReducer = (state = initialState, action) => {
    switch (action.type) {
        case GAMES_LOADED:
            return {...state, games: action.payload}
        default:
            return state
    }
}