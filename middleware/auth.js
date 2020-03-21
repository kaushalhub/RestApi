const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
      // Get token from Header

      const token = req.header('x-auth-token');

      // check if no token is provided
      
      if(!token) {
          return res.status(401).json({ msg: 'No Token, authorization denied'});
      }

      // verify token signature

      try {
            const decoded = jwt.verify(token, config.get('jwtSecret'));
            req.user = decoded.user;
            next();
      }

      catch(err) {
            res.status(401).json({ msg: 'Token is Not Valid'});
      }

}