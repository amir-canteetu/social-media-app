export const assignId = (req, res, next) => {
    req.id = Math.floor(Math.random() * 1000);
    next();
  };
  