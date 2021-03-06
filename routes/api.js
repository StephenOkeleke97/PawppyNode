const express = require("express");
const passport = require("passport");
const { Favorites } = require("../schema/schema");
const router = express.Router();

const sendFavoritesResponse = (res, status, message, isSuccess, favorites) => {
  const data = {
    message: message,
    success: isSuccess,
  };
  if (favorites) {
    res.status(status).send({ ...data, favorites });
  } else {
    res.status(status).send(data);
  }
};

function validateRecentView(req, res, next) {
  const animal = req.body.animal;
  const user = req.user;

  if (!animal || !animal.id) {
    sendFavoritesResponse(res, 400, "Invalid Parameters", false);
    return;
  }

  const ids = user.recentlyViewed.map((animal) => animal.id);
  if (ids.some((id) => id === animal.id)) {
    res.send({
      message: "success",
      success: true,
    });
    return;
  }

  next();
}

function validateFavorite(req, res, next) {
  const animal = req.body.animal;
  const user = req.user;

  if (!animal || !animal.id) {
    sendFavoritesResponse(res, 400, "Invalid Parameters", false);
    return;
  }

  Favorites.findOne({ user: user._id })
    .then((favorites) => {
      if (!favorites || favorites.animals.length <= 0) {
        next();
      } else {
        const animalsId = favorites.animals.map((res) => res.id);
        if (animalsId.some((id) => id === animal.id)) {
          const message = "This animal is already a favorite.";
          sendFavoritesResponse(res, 400, message, false);
        } else {
          next();
        }
      }
    })
    .catch((error) => {
      const message = "Something went wrong. Please try again later.";
      sendFavoritesResponse(res, 500, message, false);
    });
}

function validateLengthOfFavoritesList(req, res, next) {
  const user = req.user;

  Favorites.findOne({ user: user._id })
    .then((favorites) => {
      if (favorites && favorites.animals.length >= 10) {
        const message = "You can not favorite more than 10 animals.";
        sendFavoritesResponse(res, 400, message, false);
      } else {
        next();
      }
    })
    .catch((error) => {
      const message = "Something went wrong. Please try again later.";
      sendFavoritesResponse(res, 500, message, false);
    });
}

router.get(
  "/v1/favorites",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;
    Favorites.findOne({ user: user._id })
      .then((favorites) => {
        const animals = favorites ? favorites.animals : [];
        sendFavoritesResponse(res, 200, "Success", true, animals);
      })
      .catch((error) => {
        console.log(error);
        const message = "Something went wrong. Please try again later.";
        sendFavoritesResponse(res, 500, message, false);
      });
  }
);

router.post(
  "/v1/favorites",
  passport.authenticate("jwt", { session: false }),
  [validateFavorite, validateLengthOfFavoritesList],
  (req, res) => {
    const user = req.user;
    const animal = req.body.animal;

    Favorites.findOne({ user: user._id })
      .then((favorites) => {
        if (favorites) {
          favorites.animals.push(animal);
          favorites
            .save()
            .then((fav) => {
              const favMap = fav.animals.map((animal) => animal.id);
              console.log(fav);
              sendFavoritesResponse(res, 200, "Success", true, favMap);
            })
            .catch((error) => {
              console.log(error);
              const message = "Something went wrong. Please try again later.";
              sendFavoritesResponse(res, 500, message, false);
            });
        } else {
          const fav = new Favorites({
            user: user._id,
            animals: [animal],
          });
          fav
            .save()
            .then((favorites) => {
              const favMap = favorites.animals.map((animal) => animal.id);
              sendFavoritesResponse(res, 200, "Success", true, favMap);
            })
            .catch((error) => {
              console.log(error);
              const message = "Something went wrong. Please try again later.";
              sendFavoritesResponse(res, 500, message, false);
            });
        }
      })
      .catch((error) => {
        console.log(error);
        const message = "Something went wrong. Please try again later.";
        sendFavoritesResponse(res, 500, message, false);
      });
  }
);

router.delete(
  "/v1/favorites",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let animalId = req.query.animal;

    if (!animalId) {
      sendFavoritesResponse(res, 400, "Invalid Params", false);
      return;
    }

    const user = req.user;
    animalId = Number(animalId);
    Favorites.findOne({ user: user._id })
      .then((favorites) => {
        if (favorites) {
          favorites.animals = favorites.animals.filter(
            (animal) => animal.id !== animalId
          );
          console.log(favorites.animals.length);
          favorites
            .save()
            .then((fav) => {
              const favMap = fav.animals.map((animal) => animal.id);
              sendFavoritesResponse(res, 200, "Success", true, favMap);
            })
            .catch((error) => {
              console.log(error);
              const message = "Something went wrong. Please try again later.";
              sendFavoritesResponse(res, 500, message, false);
            });
        } else {
          sendFavoritesResponse(res, 404, "Animal not in favorites", false);
        }
      })
      .catch((error) => {
        console.log(error);
        const message = "Something went wrong. Please try again later.";
        sendFavoritesResponse(res, 500, message, false);
      });
  }
);

router.get(
  "/v1/recent-views",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

router.post(
  "/v1/recentviews",
  passport.authenticate("jwt", { session: false }),
  [validateRecentView],
  (req, res) => {
    const user = req.user;
    const animal = req.body.animal;

    if (user.recentlyViewed.length >= 10) {
      user.recentlyViewed.shift();
    }

    user.recentlyViewed.push(animal);
    user
      .save()
      .then((result) => {
        res.send({
          message: "Success",
          success: true,
        });
      })
      .catch((error) => {
        res.status(500).send({
          message: "Something went wrong. Please try again later.",
          success: false,
        });
        console.log(error);
      });
  }
);

router.get(
  "/v1/recentviews",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;

    res.send({
      message: "Success",
      success: false,
      recent: user.recentlyViewed.reverse(),
    });
  }
);

module.exports = router;
