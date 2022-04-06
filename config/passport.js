const dotenv = require("dotenv");
const { User } = require("../schema/schema");
const JWTStrategy = require("passport-jwt").Strategy;

dotenv.config();

const PUB_KEY = process.env.id_rsa_pub;

const cookieExtractor = (req) => {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

const strategy = new JWTStrategy(options, (payload, done) => {
    User.findById(payload.sub)
    .then(user => {
        if (user) return done(null, user);
        else return done(null, false);
    })
    .catch(err => {
        return done(err, null);
    });
});

module.exports = (passport) => {
    passport.use(strategy);
}

