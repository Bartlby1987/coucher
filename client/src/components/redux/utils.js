export const sendRequest = async (param, url, method = "GET") => {
    let obj = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    let response;
    if (param) {
        response = await fetch(url + new URLSearchParams(param), obj);
    } else {
        response = await fetch(url, obj);
    }
    return await response.json();
};