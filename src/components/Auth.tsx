import React, { useState } from "react";
import { signUp, signIn, logOut } from "../utils/auth-utils";
import { Button, TextField, Box, Typography } from "@mui/material";
import { useAuth } from "../providers/useAuth";

const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading, userData } = useAuth();
  console.log("!user", user, "userData,", userData);

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 4, textAlign: "center" }}>
      <Typography variant='h4'>{isSignUp ? "Sign Up" : "Sign In"}</Typography>

      {error && <Typography color='error'>{error}</Typography>}

      <TextField
        fullWidth
        label='Email'
        variant='outlined'
        margin='normal'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label='Password'
        variant='outlined'
        margin='normal'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button variant='contained' onClick={handleAuth} sx={{ mt: 2 }}>
        {isSignUp ? "Sign Up" : "Sign In"}
      </Button>

      <Button
        variant='text'
        onClick={() => setIsSignUp(!isSignUp)}
        sx={{ mt: 2 }}>
        {isSignUp ? "Already have an account? Sign In" : "Create an account"}
      </Button>

      <Button variant='outlined' onClick={logOut} sx={{ mt: 2 }}>
        Log Out
      </Button>
    </Box>
  );
};

export default Auth;
