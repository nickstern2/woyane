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
import * as firestoreAdmin from "firebase-admin/firestore";

const FieldValue = firestoreAdmin.FieldValue;
const Timestamp = firestoreAdmin.Timestamp;

// todo: Needs diff key for prod
const stripe = new Stripe(functions.config().stripe.test_secret, {
  apiVersion: "2025-01-27.acacia",
});

admin.initializeApp();
const firestore = admin.firestore(); // Global Firestore instance
const projectId = admin.instanceId().app.options.projectId;
console.log("!projectId in BE", projectId);
// export const BASE_URL = `https://us-central1-${projectId}.cloudfunctions.net`;
// console.log("!BASE_URL In BE", BASE_URL);
// export const BASE_URL =
//   functions.config().env?.mode === "development"
//     ? `http://127.0.0.1:5001/${projectId}/us-central1`
//     : `https://us-central1-${projectId}.cloudfunctions.net`;

console.log("!! Running in", functions.config().env?.mode);
// console.log("!!BASE_URL", BASE_URL);
// const corsHandler = cors({ origin: true });
const corsHandler = cors({
  origin: [
    "http://localhost:5173",
    "https://www.woyanemovie.com",
    "https://woyanemovie.com",
  ], // Allow localhost + production
  methods: ["GET", "POST", "OPTIONS"], // Explicitly allow necessary methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow content headers
  credentials: true, // Allow credentials if needed
});

const PRICES = {
  rent: 5.99, // $5.99
  purchase: 8.99, // $8.99
};

// Get prices for frontend
exports.getPrices = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      res.status(200).json(PRICES);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });
});

// TODO: Test that this works after firebase deploy --only functions
const EXCHANGE_RATE_API_KEY = functions.config().exchangerateapi.key;
const API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`;

exports.convertCurrency = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const targetCurrency = Array.isArray(req.query.targetCurrency)
        ? req.query.targetCurrency[0].toString().toUpperCase()
        : String(req.query.targetCurrency || "").toUpperCase();

      const amount = parseFloat(
        Array.isArray(req.query.amount)
          ? req.query.amount[0].toString()
          : String(req.query.amount || "0")
      );
      console.log(
        "!!Strart conversion targetCurrency:",
        targetCurrency,
        "amount:",
        amount
      );
      //  Ensure valid currency & amount
      if (!targetCurrency || isNaN(amount) || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid targetCurrency or amount" });
      }

      // Fetch exchange rates from API
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log("!!conversion data", data);
      if (data.result !== "success") {
        return res
          .status(500)
          .json({ error: "Failed to fetch exchange rates" });
      }

      // Get conversion rate for the target currency
      const rate = data.conversion_rates[targetCurrency];
      if (!rate) {
        return res.status(400).json({ error: "Invalid target currency" });
      }

      // Convert USD to target currency
      const convertedAmount = (amount * rate).toFixed(2);

      return res.status(200).json({
        baseCurrency: "USD",
        targetCurrency,
        originalAmount: amount,
        convertedAmount,
        exchangeRate: rate,
      });
    } catch (error) {
      console.error("Currency conversion error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

async function getConvertedAmount(amountUSD: number, currency: string) {
  console.log("!!projectId", projectId);
  const URL = `https://us-central1-${projectId}.cloudfunctions.net/convertCurrency?amount=${amountUSD}&targetCurrency=${currency}`;
  // const emulatorURL =  `http://127.0.0.1:5001/woyane-36a2f/us-central1/convertCurrency?amount=${amountUSD}&targetCurrency=${currency}`
  try {
    // TODO: Needs diff url for production
    const response = await fetch(URL);
    const data = await response.json();
    return parseFloat(data.convertedAmount);
  } catch (error) {
    console.error("Currency conversion failed:", error);
    return amountUSD; // Fallback to USD price if conversion fails
  }
}
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { currency, isRented } = req.body;

      const usdPrice = isRented ? PRICES.rent : PRICES.purchase;

      const convertedAmount = await getConvertedAmount(usdPrice, currency);
      const finalAmount = Math.round(convertedAmount * 100);

      // TODO: Need to make a FE error for this
      if (!convertedAmount) {
        res.status(500).json({ error: "Failed to fetch exchange rate" });
        return;
      }

      if (!usdPrice || !currency) {
        res.status(400).json({ error: "Missing payment amount or currency" });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency,
        automatic_payment_methods: { enabled: true },
      });

      if (paymentIntent.status !== "succeeded") {
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
        return;
      }
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
      return;
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
      return;
    }
  });
});

exports.updateUserDetailsAfterPurchase = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { userId, isRented } = req.body;
        console.log(
          "!!! updateUserDetailsAfterPurchase inside",
          userId,
          isRented
        );

        if (!userId) {
          console.log("!Missing user ID");
          res.status(400).json({ error: "Missing user ID" });
          return;
        }
        const userRef = firestore.collection("users").doc(userId);

        const updateData = isRented
          ? {
              isRented: true,
              rentalHistory: FieldValue.arrayUnion({
                rentalDate: Timestamp.now(),
              }),
            }
          : {
              isPurchased: true,
              purchaseHistory: FieldValue.arrayUnion({
                purchaseDate: Timestamp.now(),
              }),
            };

        console.log("!!updateData", updateData);
        await userRef.set(updateData, { merge: true });

        res
          .status(200)
          .json({ success: true, message: "User purchase history updated" });
      } catch (error) {
        console.log("!!error", error);
        console.error("Error updating user purchase history:", error);
        res.status(500).json({ error: error });
      }
    });
  }
);

exports.getSupportedCountries = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const countrySpecs = await stripe.countrySpecs.list();

      console.log("!!countrySpecs", countrySpecs);

      const formattedCountries = countrySpecs.data.map((country) => ({
        country: country.id,
        supportedCurrencies: country.supported_payment_currencies,
      }));

      res.status(200).json(formattedCountries);
    } catch (error) {
      console.error("Error fetching supported countries:", error);
      res.status(500).json({ error: "Failed to fetch country data" });
    }
  });
});

const getSafeUserData = (
  userData: FirebaseFirestore.DocumentData | undefined
) => {
  return {
    isRented:
      typeof userData?.isRented === "boolean" ? userData.isRented : false,
    isPurchased:
      typeof userData?.isPurchased === "boolean" ? userData.isPurchased : false,
    rentalHistory: Array.isArray(userData?.rentalHistory)
      ? userData.rentalHistory
      : [],
    purchaseHistory: Array.isArray(userData?.purchaseHistory)
      ? userData.purchaseHistory
      : [],
    ...userData, // Preserve any other fields in the document
  };
};

//
// TODO: look into this
// functions.https.onCall
exports.getUserData = functions.https.onRequest(async (req, res) => {
  console.log("!!getUserData");
  corsHandler(req, res, async () => {
    console.log("!!getUserData IN CORS");
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    try {
      const uid = req.query.uid as string;

      if (!uid) {
        console.error("Missing UID in request.");
        return res.status(400).json({ error: "Missing user ID" });
      }

      console.log(`Fetching data for user UID: ${uid}`);

      const userRef = admin.firestore().collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists || !userDoc.data()) {
        console.warn(`User exists but has no data. Returning default values.`);
        // Return default values if user exists but has no data
        return res.json({
          isRented: false,
          isPurchased: false,
          rentalHistory: [],
          purchaseHistory: [],
        });
      }

      // Use helper function for safe data
      const userData = getSafeUserData(userDoc.data());

      console.log("User data retrieved successfully:", userData);

      return res.json(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});
