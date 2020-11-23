import {GAMES_LOADED, HIDE_LOADER, SHOW_LOADER} from "./types";
import {sendRequest} from "./utils";

export function getGames(param=null) {
    return async dispatch => {
        dispatch(showLoader())
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
        dispatch(hideLoader())
    }
}

export function showLoader() {
    return {
        type: SHOW_LOADER
    }
}

export function hideLoader() {
    return {
        type: HIDE_LOADER
    }
}

