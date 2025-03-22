import AppConfig from "./app-config";

const projectId = AppConfig.FirebaseProjectId;
const LOCAL_BASE_URL = `http://127.0.0.1:5001/${projectId}/us-central1`;
const PROD_BASE_URL = `https://us-central1-${projectId}.cloudfunctions.net`;

// Automatically select the right base URL
// export const BASE_URL =
//   window.location.hostname === "localhost" ? LOCAL_BASE_URL : PROD_BASE_URL;
export const BASE_URL = PROD_BASE_URL;
// process.env.FUNCTIONS_EMULATOR === "true" ? LOCAL_BASE_URL : PROD_BASE_URL;
/**
 * Generic function to call Firebase Cloud Functions
 * @param {string} functionName - The Firebase function name
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} method - HTTP method
 * @param {object} [bodyOrParams] - Optional body or params data (for POST/PUT/GET)
 */
export const callFunction = async <T>(
  functionName: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  bodyOrParams?: object
): Promise<T> => {
  const url = new URL(`${BASE_URL}/${functionName}`);

  // If it's a GET request, treat `bodyOrParams` as query parameters
  if (method === "GET" && bodyOrParams) {
    Object.entries(bodyOrParams).forEach(([key, value]) =>
      url.searchParams.append(key, String(value))
    );
  }

  console.log("!!url", url.toString());
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(method !== "GET" && bodyOrParams
      ? { body: JSON.stringify(bodyOrParams) }
      : {}),
  };

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`!Error calling ${functionName}:`, error);
    throw error;
  }
};
