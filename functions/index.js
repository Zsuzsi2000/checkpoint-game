/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
//
// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v4');
const fbAdmin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'checkpoint-game-399d6'
});

fbAdmin.initializeApp({
  credential: fbAdmin.credential.cert({
    "type": "service_account",
    "project_id": "checkpoint-game-399d6",
    "private_key_id": "4ee7cb7ea45feb9140b3f57abcf9581b9c9b1800",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDQnVTdsRl8uETk\nF2EMK07uLN8AYOdb2GVhMF/49YPNt6UlzpVwzg+0ttkcKPsuF6SDLzsETjq4rtr6\nMjH6J7QyWr/SNKKAtHkJcs2VVROft8MghvTirSJQNrKwlrNSArshLHkLktIEABbk\nnREnRcK1yVFA2twmrc/YjFlHWlLFvJWDmnXpGy7UlIc5V7vd2fUOrNTIANGPqEMY\nQb13Xdgt8+MdhEndHrpbtGCmACceANAzX2bpWeEH4OdsaOrxCe/FQu+ZVu4we1kY\nsrwdPAT+KAWWnbiqb3fNQGRz52OFzaDSxVVWGwsZEUZ2Sd9YlqG3tfoSVybovmG0\nisxt2TrHAgMBAAECggEABKSDt31R/mMRcWwNxloOYyGPgvAlJfeeZffQIve/y6u7\nGqjKzZxgYBqzoTtOP7vZ9uttqk5dYy/NAsVsNE9+5KH9Y921Ah1CFlI+PgULL0JF\nLuuh9ot42IUnG+P2sKwL4xScywOk9d7Uo5jVQWT9jNMioklcneW/WufgssRRVEIw\nXZrjy93gmhm3P3dc4PfRdPuOinGkcmTE3zqqO9cwQe+G83iXuSdaCuxLnhZjZNZL\n0JTWgrxkF9+wUFBbdi3bz+J6Jmz42XeeIogCIVmXxwsMJDY5OWYd6bDEEhRYz53h\n3qb4tlabupCfhIgkpMFCyB8zlvc3J2hwEDcpmUNPSQKBgQDs2q5HSNXlhq+Vsw4W\nNXe2h3Ax7Z8I4uXL+Y0jN7H/CnP6gZjmdDYnpYijt4KELjwRi9aJpjRtl+3CFefu\nN8YnIobqdE+F6aBWDnhvgV91dQY48VpTexZWDkzlFqzr6vduhEoya/cVELaCtcEV\nO6rSO3Dnsh1TPN6/XLMXZkht2QKBgQDhekbE6pL171HLUP9ArI/OOofual3EGty/\nQpfpO6Xc+ncQinKBu2QbTtD8UN7KpygQYbzNikASlwq4g2hdmxs9UM1kCCJNQcVn\nlp7u54972m4IGi9lmi6DSFqouhgr9fyjbMlbBwujrpnDST0FSDRLg0stjXULd0nU\nmoBqy+dpnwKBgHw+cjE+icVvE2gJlxgbUALVpQrrxQLaUwTekSSqMJrClvgPR2+M\nAmRltvl6Z+KChkwF+LIYF2Rtz/CBoToa07zvpaoS/SwX012RFagYS0TH8E2qfWFR\nLfRSaA+8B1Vx2f2FM46jh+bq73I9eV10ATVqrN09V5i0U3w6Wk+p/dBxAoGAKOdW\nyUhIqsbkjr6934yuddoWaMDxC69X1naNOmlwuHrTeLO0/CXzjiSpMuy0zgyu7vHc\nH2lyIC04a6qjF0AZG/F5oSj8mAlTd2xSnsJxPCWvClc9u+/Rek147Nz9n5P7ZeZJ\nTPMlQGdfS5cQs9Gacwx5aeUck5zrTt9MZpNhAr8CgYALYSuukkGx4wX3S7IaDMDh\nm5Z+keA8amOqNKTZd+lnnzwz2p1HRuRTnzsz+IIIryoGls2Qw+O/j0TchpYCH17R\nb021aiURNMp1yjbd+JzlvuHP4ExG1YJ4R/RdfDcmMrY86oHiFGJ7GD3sNQQdao/G\ngQoe0fXMQoVgdtm4Cq4bug==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-15xqu@checkpoint-game-399d6.iam.gserviceaccount.com",
    "client_id": "108123038571822766671",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-15xqu%40checkpoint-game-399d6.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  })
  // databaseURL: "https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app"
});

exports.storeImage = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(500).json({ message: 'Not allowed.' });
    }

    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      return res.status(401).json({ error: 'Unauthorized!' });
    }

    let idToken;
    idToken = req.headers.authorization.split('Bearer ')[1];

    const busboy = new Busboy({ headers: req.headers });
    let uploadData;
    let oldImagePath;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const filePath = path.join(os.tmpdir(), filename);
      uploadData = { filePath: filePath, type: mimetype, name: filename };
      file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on('field', (fieldname, value) => {
      oldImagePath = decodeURIComponent(value);
    });

    busboy.on('finish', () => {
      const id = uuid();
      let imagePath = 'images/' + id + '-' + uploadData.name;
      if (oldImagePath) {
        imagePath = oldImagePath;
      }

      return fbAdmin
        .auth()
        .verifyIdToken(idToken)
        .then(decodedToken => {
          console.log(uploadData.type);
          return storage
            .bucket('checkpoint-game-399d6.appspot.com')
            .upload(uploadData.filePath, {
              uploadType: 'media',
              destination: imagePath,
              metadata: {
                metadata: {
                  contentType: uploadData.type,
                  firebaseStorageDownloadTokens: id
                }
              }
            });
        })
        .then(() => {
          return res.status(201).json({
            imageUrl:
              'https://firebasestorage.googleapis.com/v0/b/' +
              storage.bucket('checkpoint-game-399d6.appspot.com').name +
              '/o/' +
              encodeURIComponent(imagePath) +
              '?alt=media&token=' +
              id,
            imagePath: imagePath
          });
        })
        .catch(error => {
          console.log(error);
          return res.status(401).json({ error: 'Unauthorized!' });
        });
    });
    return busboy.end(req.rawBody);
  });
});

