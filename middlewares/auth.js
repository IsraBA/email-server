async function auth(req, res, next) {
    try {
        req.user = { _id: "66168d588eea0054ac8a279c" }

        next()
    }
    catch {
        res.sendStatus(401);
    }
}

module.exports = { auth }