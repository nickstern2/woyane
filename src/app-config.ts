export type Config = {
  FirebaseProjectId: string;
  StripePK: string;
};

const loadConfig = (): Config => {
  console.log(
    "!isProduction?",
    import.meta.env.MODE === "production" ? "Production" : "Dev"
  );
  return {
    FirebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    StripePK:
      import.meta.env.MODE === "production"
        ? import.meta.env.VITE_STRIPE_LIVE_PK ?? ""
        : import.meta.env.VITE_STRIPE_TEST_PK ?? "",
  };
};

export default Object.freeze(loadConfig());
