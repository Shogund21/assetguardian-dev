import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(loginEmail, loginPassword);
      
      console.log("Sign in result:", result);
      
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        navigate("/");
      } else {
        console.error("Sign in failed with error:", result.error);
        const errorMessage = result.error || "Sign in failed. Please try again.";
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp(signupEmail, signupPassword, signupFirstName, signupLastName);
      
      console.log("Sign up result:", result);
      
      if (result.success) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        // Don't navigate immediately - user needs to verify email
      } else {
        console.error("Sign up failed with error:", result.error);
        const errorMessage = result.error || "Sign up failed. Please try again.";
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await resetPassword(resetEmail);
      
      if (result.success) {
        toast({
          title: "Reset link sent!",
          description: "Check your email for password reset instructions.",
        });
        setShowResetForm(false);
        setResetEmail("");
      } else {
        setError(result.error || "Password reset failed");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center">
          <Link to="/landing" className="inline-block">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="Asset Guardian Logo" 
              className="h-16 w-16 mx-auto mb-4" 
            />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Asset Guardian</h1>
          <p className="text-muted-foreground">Access your facilities management platform</p>
        </div>

        {showResetForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address to receive reset instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading || !resetEmail.trim()}
                    className="flex-1"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowResetForm(false);
                      setError("");
                      setResetEmail("");
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="p-6 pt-4">
                  <div className="space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Welcome Back</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in to your account to continue
                    </p>
                  </div>
                  
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="loginEmail">Email</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="loginPassword">Password</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !loginEmail.trim() || !loginPassword.trim()}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-sm text-primary hover:underline"
                        disabled={loading}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="p-6 pt-4">
                  <div className="space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Create Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign up for a new account to get started
                    </p>
                  </div>
                  
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signupFirstName">First Name</Label>
                        <Input
                          id="signupFirstName"
                          type="text"
                          placeholder="First name"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="signupLastName">Last Name</Label>
                        <Input
                          id="signupLastName"
                          type="text"
                          placeholder="Last name"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="signupEmail">Email</Label>
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="signupPassword">Password</Label>
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="Create a password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !signupEmail.trim() || !signupPassword.trim()}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact your administrator for access.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Don't have access yet?{" "}
            <Link 
              to="/landing" 
              className="text-primary hover:underline font-medium"
            >
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;