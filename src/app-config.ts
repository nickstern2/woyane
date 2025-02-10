export type Config = {
  FirebaseProjectId: string;
};

const loadConfig = (): Config => {
  return {
    FirebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  };
};

export default Object.freeze(loadConfig());
