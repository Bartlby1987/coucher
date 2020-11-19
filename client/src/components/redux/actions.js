import {GAMES_LOADED} from "./types";
import {sendRequest} from "./utils";

export function getGames(param=null) {
    return async dispatch => {
        let url = "/games/list/";
        const response = await sendRequest(param, url, "GET");
        dispatch({type: GAMES_LOADED, payload: response})
    }
}

