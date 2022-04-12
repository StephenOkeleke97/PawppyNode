const axios = require("axios");
const { Token } = require("../schema/schema");

const timeout = "60000";
const apiRequestURL = "https://api.petfinder.com/v2/oauth2/token";
const animalsURL = "https://api.petfinder.com/v2/animals";
const animalTypesURL = "https://api.petfinder.com/v2/types";

async function requestToken(id, secret) {
  const data = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: id,
    client_secret: secret,
  });

  const response = await axios.post(apiRequestURL, data, {
    timeout: timeout,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response;
}

async function getPets(params) {
  const token = await Token.findOne({name: "jwt"});

  const result = await axios.get(animalsURL, {
    timeout: timeout,
    headers: {
      "Authorization": "Bearer " + token.token
    }
  });

  return result;
}

async function getTypes() {
  const token = await Token.findOne({name: "jwt"});

  const result = await axios.get(animalTypesURL, {
    timeout: timeout,
    headers: {
      "Authorization": "Bearer " + token.token
    }
  });

  return result;
}

module.exports = {
  requestToken: requestToken,
  getPets: getPets,
  getTypes: getTypes
};
