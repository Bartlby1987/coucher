import {GET_GAMES} from "./types";
import {sendRequest} from "./utils";

export function gatGames(param=null) {
    return async dispatch => {
        let url = "/games/list/";
        const response = await sendRequest(param, url, "GET");
        dispatch({type: GET_GAMES, payload: response})
    }
}

