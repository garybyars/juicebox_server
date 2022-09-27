const requireUser = (req, res, next) => {
  if(!req.user) {
    next({
      name: "MissingUserError",
      message: "you must be logged in to perform this action"
    });
  }

  next();
}

module.exports = {
  requireUser
}