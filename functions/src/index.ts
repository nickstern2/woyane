/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// export const getUserData = functions.https.onRequest(async (req, res) => {
//   const uid = req.query.uid as string;
//   if (!uid) {
//     return res.status(400).json({ error: "Missing user ID" });
//   }

//   try {
//     const userDoc = await admin.firestore().collection("users").doc(uid).get();
//     if (!userDoc.exists) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.json(userDoc.data());
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// export const getUserData = functions.https.onRequest(async (req, res) => {
//   const uid = req.query.uid as string;

//   if (!uid) {
//     return res.status(400).json({ error: "Missing user ID" });
//   }

//   try {
//     const userDoc = await admin.firestore().collection("users").doc(uid).get();

//     if (!userDoc.exists) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     return res.json(userDoc.data());
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: (error as Error).message || "Internal server error" });
//   }
// });
export const getUserData = functions.https.onRequest(async (req, res) => {
  const uid = req.query.uid as string;

  if (!uid) {
    res.status(400).json({ error: "Missing user ID" });
    return;
  }

  try {
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(userDoc.data());
  } catch (error) {
    res
      .status(500)
      .json({ error: (error as Error).message || "Internal server error" });
  }
});
