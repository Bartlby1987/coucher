import {GAMES_LOADED} from "./types";
import {sendRequest} from "./utils";

export function getGames(param=null) {
    return async dispatch => {
        let url = "/games/list/";
        let newParam;
        if (param) {
            newParam = {
                limit: param.rowsPerPage,
                offset: param.page*param.rowsPerPage,
                sortColumn: (param.orderBy).toUpperCase(),
                sortDirection: (param.order).toUpperCase()
            };
            url = "/games/list?";
        }
        const response = await sendRequest((newParam), url);
        dispatch({type: GAMES_LOADED, payload: response, paramLoad: param})
    }
}

