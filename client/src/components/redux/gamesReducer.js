import { GAMES_LOADED} from "./types";

const initialState = {
    games: [],
    paramLoad: {
        order: 'asc',
        orderBy: 'name',
        selected: [],
        page: 0,
        dense: false,
        rowsPerPage: 10
    },
}

export const gamesReducer = (state = initialState, action) => {
    switch (action.type) {
        case GAMES_LOADED:
            return {...state, games: action.payload,paramLoad: action.paramLoad}
        default:
            return state
    }
}