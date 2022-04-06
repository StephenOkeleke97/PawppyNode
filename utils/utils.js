const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function generatePassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const generatedHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return {
    salt: salt,
    hash: generatedHash,
  };
}

function validPassword(password, salt, hash) {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return verifyHash === hash;
}

function issueJWT(user) {
  const _id = user._id;
  const expiresIn = Date.now() + 3600000 * 24;

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.id_rsa_priv, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: signedToken,
    expiresIn: expiresIn,
  };
}

module.exports = {
  validPassword: validPassword,
  generatePassword: generatePassword,
  issueJWT: issueJWT,
};
