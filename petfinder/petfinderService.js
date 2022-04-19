const axios = require("axios");
const { Token } = require("../schema/schema");

const timeout = "60000";
const host = "https://api.petfinder.com/v2/"
const apiRequestURL = host + "oauth2/token";
const animalsURL = host + "animals";
const animalTypesURL = host + "types";
const organizationsURL = host + "organizations";

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
  const token = await Token.findOne({ name: "jwt" });

  const result = await axios.get(animalsURL, {
    timeout: timeout,
    headers: {
      Authorization: "Bearer " + token.token,
    },
    params: params
  });

  return result;
}

async function getPet(id) {
  const url = host + "animals/" + id
  const token = await Token.findOne({ name: "jwt" });

  const result = await axios.get(url, {
    timeout: timeout,
    headers: {
      Authorization: "Bearer " + token.token,
    },
  });

  return result;
}

async function getTypes() {
  const token = await Token.findOne({ name: "jwt" });

  const result = await axios.get(animalTypesURL, {
    timeout: timeout,
    headers: {
      Authorization: "Bearer " + token.token,
    },
  });

  return result;
}

async function getBreed(type) {
  const animalBreedURL = animalTypesURL + `/${type}/breeds`;
  const token = await Token.findOne({ name: "jwt" });

  const result = await axios.get(animalBreedURL, {
    timeout: timeout,
    headers: {
      Authorization: "Bearer " + token.token,
    },
  });

  return result;
}

async function getOrganizations() {
  const token = await Token.findOne({ name: "jwt" });

  const result = await axios.get(organizationsURL, {
    timeout: timeout,
    headers: {
      Authorization: "Bearer " + token.token,
    },
  });

  return result;
}

module.exports = {
  requestToken: requestToken,
  getPets: getPets,
  getTypes: getTypes,
  getBreed: getBreed,
  getOrganizations: getOrganizations,
  getPet: getPet
};
