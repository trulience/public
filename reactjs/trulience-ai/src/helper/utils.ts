/**
 * Retrieves the value of a query parameter from the URL.
 * @param {string} paramName - The name of the query parameter to retrieve.
 * @param {string} defaultValue - The default value to return if the parameter is not found.
 * @returns {string|null} The value of the query parameter or the default value if not found.
 */
function getQueryParam(paramName: string, defaultValue: string | null = null): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName) || defaultValue;
}

const utils = {
    getQueryParam
}

export default utils
