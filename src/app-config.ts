export type Config = {
  FirebaseProjectId: string;
  StripePK: string;
};

const loadConfig = (): Config => {
  return {
    FirebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    StripePK: import.meta.env.VITE_STRIPE_TEST_PK ?? "",
  };
};

export default Object.freeze(loadConfig());
