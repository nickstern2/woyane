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
import cors from "cors";
import Stripe from "stripe";

// const stripe = new Stripe(
//   functions.config().stripe[
//     functions.config().mode === "production" ? "live_secret" : "test_secret"
//   ]
// );
const stripe = new Stripe(functions.config().stripe.test_secret);
console.log("!!HERE OTHER new test");
admin.initializeApp();
const corsHandler = cors({ origin: true });
if (process.env.FUNCTIONS_EMULATOR) {
  console.log("! Running in Firebase Emulator Mode");

  admin.firestore().settings({
    host: "localhost:8080",
    ssl: false, // Required to avoid SSL connection issues
  });

  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
}
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  console.log("!! HERE2:");
  corsHandler(req, res, async () => {
    try {
      const { amount, currency, userId, isRented } = req.body;
      // console.log("!! req:", req);
      // console.log("!! res:", res);
      console.log("!!submit BE isRented", isRented);
      console.log("!!submit BE", amount, currency);
      if (!amount || !currency) {
        res.status(400).json({ error: "Missing payment amount or currency" });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
      });

      console.log("!!paymentIntent", paymentIntent);
      console.log("!!IS SUCCESS", paymentIntent.status === "succeeded");
      // After successful payment
      if (paymentIntent.status === "succeeded") {
        console.log("!!paymentIntent succeeded");
        const userRef = admin.firestore().collection("users").doc(userId);

        const updateData = isRented
          ? {
              isRented: true,
              rentalHistory: admin.firestore.FieldValue.arrayUnion({
                rentalDate: admin.firestore.FieldValue.serverTimestamp(),
              }),
            }
          : {
              isPurchased: true,
              purchaseHistory: admin.firestore.FieldValue.arrayUnion({
                purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
              }),
            };
        console.log("!!updateData", updateData);
        await userRef.update(updateData);
      }

      console.log("!!submit Success BE paymentIntent", paymentIntent);
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
      return;
    } catch (error: any) {
      console.log("!!submit Error BE", error, error?.message);
      res.status(500).json({ error: error?.message });
      return;
    }
  });
});

// Get User data including purchase/rental history and User Details such as isLoggedIn & isVerified
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
