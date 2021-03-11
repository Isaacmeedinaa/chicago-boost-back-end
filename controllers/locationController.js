const _ = require("lodash");
const { Location, locationValidator } = require("../models/Location");

const locationController = {
  testing: (req, res) => {
    return res.send({ message: "hello" });
  },
  getLocations: async (req, res) => {
    const locations = await Location.find().select("-__v");
    return res.status(200).send(locations);
  },
  getLocation: async (req, res) => {
    try {
      const location = await Location.findById(req.params.id).select("-__v");

      if (!location)
        return res.status(404).send({ error: "Location was not found!" });

      return res.status(200).send(location);
    } catch (err) {
      return res.status(404).send({ error: err });
    }
  },
  createLocation: async (req, res) => {
    const { error } = locationValidator(req.body);
    if (error) {
      const errorsArray = error.details.map((error) => {
        let errorObj = {};
        errorObj.field = error.path[0];
        errorObj.message = error.message;
        return errorObj;
      });
      return res.status(400).send({ validationErrors: errorsArray });
    }

    let location = new Location(
      _.pick(req.body, [
        "name",
        "phoneNumber",
        "facebookLink",
        "addressLineOne",
        "addressLineTwo",
        "city",
        "state",
        "zipcode",
        "country",
      ])
    );

    location = await location.save();
    location = await Location.findById(location._id).select("-__v");

    return res.status(200).send(location);
  },
  updateLocation: async (req, res) => {
    const { error } = locationValidator(req.body);
    if (error) {
      const errorsArray = error.details.map((error) => {
        let errorObj = {};
        errorObj.field = error.path[0];
        errorObj.message = error.message;
        return errorObj;
      });
      return res.status(400).send({ validationErrors: errorsArray });
    }

    try {
      const location = await Location.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          facebookLink: req.body.facebookLink,
          addressLineOne: req.body.addressLineOne,
          addressLineTwo: req.body.addressLineTwo,
          city: req.body.city,
          state: req.body.state,
          zipcode: req.body.zipcode,
          country: req.body.country,
        },
        {
          new: true,
        }
      ).select("-__v");

      if (!location)
        return res.status(404).send({ error: "Location was not found!" });

      return res.status(200).send(location);
    } catch (err) {
      return res.status(404).send({ error: err });
    }
  },
  deleteLocation: async (req, res) => {
    try {
      const location = await Location.findByIdAndRemove(req.params.id).select(
        "-__v"
      );

      if (!location)
        return res.status(404).send({ message: "Location was not found!" });

      return res.status(200).send(location);
    } catch (err) {
      return res.status(404).send({ error: err });
    }
  },
};

module.exports = locationController;
