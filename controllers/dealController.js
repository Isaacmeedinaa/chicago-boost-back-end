const _ = require("lodash");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { Expo } = require("expo-server-sdk");
const { User } = require("../models/User");
const { Deal, dealValidator } = require("../models/Deal");
const { Photo, photoValidator } = require("../models/Photo");
const { Location } = require("../models/Location");

const dealController = {
  getDeals: async (req, res) => {
    const deals = await Deal.find()
      .populate("photos", "-__v")
      .populate("locations", "-__v")
      .select("-__v");
    return res.status(200).send(deals);
  },
  getDeal: async (req, res) => {
    try {
      const deal = await Deal.findById(req.params.id)
        .populate("photos", "-__v")
        .populate("locations", "-__v")
        .select("-__v");

      if (!deal) return res.status(404).send({ error: "Deal was not found!" });

      return res.status(200).send(deal);
    } catch {
      return res.status(404).send({ error: err });
    }
  },
  createDeal: async (req, res) => {
    const photos = req.files;

    const dealObj = {
      title: req.body.title,
      description: req.body.description,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      locations: JSON.parse(req.body.locations),
    };

    const { error } = dealValidator(dealObj);
    if (error) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        fs.unlinkSync(`./${photo.path}`);
      }
      const errorsArray = error.details.map((error) => {
        let errorObj = {};
        errorObj.field = error.path[0];
        errorObj.message = error.message;
        return errorObj;
      });
      return res.status(400).send({ validationErrors: errorsArray });
    }

    let deal = new Deal(
      _.pick(dealObj, ["title", "description", "startDate", "endDate"])
    );

    deal = await deal.save();

    const reqLocations = JSON.parse(req.body.locations);
    for (let i = 0; i < reqLocations.length; i++) {
      const locationId = reqLocations[i];

      let location = await Location.findById(locationId);
      if (!location)
        return res.status(404).send({ message: "Location was not found!" });

      deal.locations.push(location);
      await deal.save();
    }

    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        let cloudinaryFileData;

        try {
          cloudinaryFileData = await cloudinary.uploader.upload(photo.path, {
            resource_type: "auto",
          });
          fs.unlinkSync(`./${photo.path}`);
        } catch {
          return res.status(400).send({
            message: "An error occured while trying to upload photo.",
          });
        }

        let cloudinaryFileDataObj = {
          url: cloudinaryFileData.url,
          publicId: cloudinaryFileData.public_id,
          deal: deal._id.toString(),
        };

        const { error } = photoValidator(cloudinaryFileDataObj);
        if (error) {
          fs.unlinkSync(`./${photo.path}`);
          await cloudinary.uploader.destroy(cloudinaryFileData.public_id);
          const errorsArray = error.details.map((error) => {
            let errorObj = {};
            errorObj.field = error.path[0];
            errorObj.message = error.message;
            return errorObj;
          });
          return res.status(400).send({ validationErrors: errorsArray });
        }

        let dealPhoto = new Photo(cloudinaryFileDataObj);

        dealPhoto = await dealPhoto.save();

        deal.photos.push(dealPhoto);

        await deal.save();
      }
    }

    deal = await Deal.findById(deal._id)
      .populate("photos", "-__v")
      .populate("locations", "-__v")
      .select("-__v");

    res.status(200).send(deal);

    let expo = new Expo();
    let users = await User.find().select("pushToken -_id");
    let usersWithPushToken = users.filter((user) => user.pushToken);
    let pushTokens = usersWithPushToken.map((user) => user.pushToken);

    let messages = [];
    for (const pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.log(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: "default",
        title: "Chicago Boost",
        body: "There is a new deal available! Check it out.",
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    (async () => {
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (err) {
          console.log(error);
        }
      }
    })();
  },
  updateDeal: async (req, res) => {
    const photos = req.files;

    const dealObj = {
      title: req.body.title,
      description: req.body.description,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    };

    const { error } = dealValidator(dealObj);
    if (error) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        fs.unlinkSync(`./${photo.path}`);
      }
      const errorsArray = error.details.map((error) => {
        let errorObj = {};
        errorObj.field = error.path[0];
        errorObj.message = error.message;
        return errorObj;
      });
      return res.status(400).send({ validationErrors: errorsArray });
    }

    let deal = await Deal.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
      {
        new: true,
      }
    ).select("-__v");
    if (!deal) return res.status(404).send({ message: "Deal was not found!" });

    if (req.body.deletedPhotos) {
      const deletedPhotosArray = JSON.parse(req.body.deletedPhotos);

      for (let i = 0; i < deletedPhotosArray.length; i++) {
        const photoId = deletedPhotosArray[i];

        const newDealPhotosArray = deal.photos.filter(
          (photo) => photo.toString() !== photoId
        );
        deal.photos = newDealPhotosArray;

        await deal.save();

        const photo = await Photo.findById(photoId);
        await cloudinary.uploader.destroy(photo.publicId);
        await Photo.findByIdAndRemove(photo._id);
      }
    }

    if (req.body.deletedLocations) {
      const deletedLocationsArray = JSON.parse(req.body.deletedLocations);

      for (let i = 0; i < deletedLocationsArray.length; i++) {
        const locationId = deletedLocationsArray[i];

        const newDealLocationsArray = deal.locations.filter(
          (location) => location.toString() !== locationId
        );

        deal.locations = newDealLocationsArray;

        await deal.save();
      }
    }

    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        let cloudinaryFileData;

        try {
          cloudinaryFileData = await cloudinary.uploader.upload(photo.path, {
            resource_type: "auto",
          });
          fs.unlinkSync(`./${photo.path}`);
        } catch {
          return res.status(400).send({
            message: "An error occured while trying to upload photo.",
          });
        }

        let cloudinaryFileDataObj = {
          url: cloudinaryFileData.url,
          publicId: cloudinaryFileData.public_id,
          deal: deal._id.toString(),
        };

        const { error } = photoValidator(cloudinaryFileDataObj);
        if (error) {
          fs.unlinkSync(`./${photo.path}`);
          await cloudinary.uploader.destroy(cloudinaryFileData.public_id);
          const errorsArray = error.details.map((error) => {
            let errorObj = {};
            errorObj.field = error.path[0];
            errorObj.message = error.message;
            return errorObj;
          });
          return res.status(400).send({ validationErrors: errorsArray });
        }

        let dealPhoto = new Photo(cloudinaryFileDataObj);

        dealPhoto = await dealPhoto.save();

        deal.photos.push(dealPhoto);

        await deal.save();
      }
    }

    if (req.body.newLocations) {
      const newLocationsArray = JSON.parse(req.body.newLocations);
      for (let i = 0; i < newLocationsArray.length; i++) {
        const locationId = newLocationsArray[i];

        let location = await Location.findById(locationId);
        if (!location)
          return res.status(404).send({ message: "Location was not found!" });

        deal.locations.push(location);

        await deal.save();
      }
    }

    deal = await Deal.findById(deal._id)
      .populate("photos", "-__v")
      .populate("locations", "-__v")
      .select("-__v");

    return res.status(200).send(deal);
  },
  deleteDeal: async (req, res) => {
    try {
      const deal = await Deal.findByIdAndRemove(req.params.id)
        .populate("photos", "-__v")
        .select("-__v");

      if (!deal)
        return res.status(404).send({ message: "Deal was not found!" });

      if (deal.photos.length > 0) {
        for (let i = 0; i < deal.photos.length; i++) {
          const photo = deal.photos[i];
          await cloudinary.uploader.destroy(photo.publicId);
          await Photo.findByIdAndRemove(photo._id);
        }
      }
      return res.status(200).send(deal);
    } catch (err) {
      return res.status(404).send({ error: err });
    }
  },
};

module.exports = dealController;
