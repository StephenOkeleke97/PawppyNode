const dotenv = require("dotenv");
const { User } = require("../schema/schema");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
dotenv.config();

const PUB_KEY = process.env.id_rsa_pub;

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

const strategy = new JWTStrategy(options, (payload, done) => {
  User.findById(payload.sub)
    .then((user) => {
      if (user) return done(null, user);
      else return done(null, false);
    })
    .catch((err) => {
      return done(err, null);
    });
});

module.exports = (passport) => {
  passport.use(strategy);
};
