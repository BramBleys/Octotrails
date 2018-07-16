import https from 'https';
import httpStatus from 'http-status';
import config from '../config/config';
import { validationResult, Result } from 'express-validator/check';

import APIError from '../helpers/APIError';

/**
 * Send a HTTP Request to external API
 * @param {string} url - the full URL of the API
 * @param {function} callback - The callback function when done or error.
 */
const sendRequestToAPI = function sendReq(url, errMsg, callback) {
  const sendError = () => callback(new APIError(errMsg, httpStatus.NOT_FOUND));

  https.get(url, function(respApi) {
    let apiData = '';

    if (respApi.statusCode !== 200) return sendError();

    // A chunk of data has been recieved.
    respApi.on('data', chunk => (apiData += chunk));

    // The whole response has been received. Print out the result.
    respApi.on('end', () => callback(null, JSON.parse(apiData)));

    respApi.on('error', sendError);
  });
};

/**
 * Check if the validatio has generated some errors.
 *
 * @param {Result<any>} errors
 */
const checkValidationErrors = function check(errors) {
  if (errors.isEmpty()) return;

  errors.array().forEach(e => {
    throw new APIError(e.msg, httpStatus.BAD_REQUEST);
  });
};
const STIB_API = config.stibApi;

function search(req, res, next) {
  let by = req.query.by;
  let term = req.query.term;
  let url;

  checkValidationErrors(validationResult(req));

  if (by == 'stop_name') {
    url = '/stops/name/' + term;
  } else if (by == 'stop_id') {
    url = '/stops/' + term;
  }

  sendRequestToAPI(
    STIB_API + url,
    'No results for your search!',
    (err, apiData) => {
      if (err) {
        next(err);
      } else {
        return res.json(apiData);
      }
    }
  );
}

function getProximity2(req, res, next) {
  let lon = req.query.lon;
  let lat = req.query.lat;

  console.log(req.query);

  checkValidationErrors(validationResult(req));

  let url = '/stops/proximity/' + lon + ',' + lat;

  sendRequestToAPI(
    STIB_API + url,
    'No location for your search!',
    (err, apiData) => (err ? next(err) : res.json(apiData))
  );
}

function getProximity(req, res, next) {
  let lon = req.query.lon;
  let lat = req.query.lat;

  validateProximity(lon, lat);

  let url = '/stops/proximity/' + lon + ',' + lat;

  https
    .get(STIB_API + url, function(respApi) {
      let apiData = '';

      // A chunk of data has been recieved.
      respApi.on('data', chunk => (apiData += chunk));

      // The whole response has been received. Print out the result.
      respApi.on('end', () => {
        return res.json(JSON.parse(apiData));
      });
    })
    .on('error', function(error) {
      const err = new APIError(
        'No location for your search!',
        httpStatus.NOT_FOUND
      );
      next(error);
    });
}

function validateProximity(lon, lat) {
  if (!lon || isNaN(lon)) {
    throw new APIError(
      'The value of the longitude must be a number!',
      httpStatus.BAD_REQUEST
    );
  } else if (!lat || isNaN(lat)) {
    throw new APIError(
      'The value of the latitude must be a number!',
      httpStatus.BAD_REQUEST
    );
  }
}

export default {
  search,
  getProximity
};
