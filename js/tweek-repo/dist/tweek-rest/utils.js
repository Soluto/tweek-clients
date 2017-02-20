"use strict";
function getFetchRequestData(method, data) {
    return {
        credentials: 'same-origin',
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
}
exports.getFetchRequestData = getFetchRequestData;
//# sourceMappingURL=C:/code/tweek-clients/js/tweek-repo/dist/tweek-rest/utils.js.map