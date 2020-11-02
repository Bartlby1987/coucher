function isInfoExists(gameName) {
    return (gameName === ""||!!(gameName)||(typeof gameName) === "string")
}

function isCouchOrFeaturesExists(couch) {
    return !!couch
}

module.exports = {
    isInfoExists: isInfoExists,
    isCouchOrFeaturesExists: isCouchOrFeaturesExists,
}