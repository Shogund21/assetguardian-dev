import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupCompany, setSignupCompany] = useState("");
  const [signupPurpose, setSignupPurpose] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetupButton, setShowSetupButton] = useState(true);
  
  const navigate = useNavigate();
  const { isAuthenticated, signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const showError = (message: string) => {
    setError(message);
    setSuccessMessage("");
    
    // Check if rate limited
    if (message.includes("⏰") || message.toLowerCase().includes("wait")) {
      setIsRateLimited(true);
      // Clear rate limit after 5 minutes
      setTimeout(() => setIsRateLimited(false), 5 * 60 * 1000);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setError("");
    setIsRateLimited(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const result = await signIn(loginEmail, loginPassword);
      
      if (result.success) {
        showSuccess("✅ Welcome back! Redirecting...");
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        navigate("/");
      } else {
        showError(result.error || "Sign in failed. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      showError("🌐 An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const result = await signUp(signupEmail, signupPassword, signupFirstName, signupLastName, signupPhone, signupCompany, signupPurpose);
      
      if (result.success) {
        showSuccess("🎉 Account created successfully! Check your email for confirmation.");
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        
        // Clear form on success
        setSignupEmail("");
        setSignupPassword("");
        setSignupFirstName("");
        setSignupLastName("");
        setSignupPhone("");
        setSignupCompany("");
        setSignupPurpose("");
      } else {
        showError(result.error || "Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      showError("🌐 An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const result = await resetPassword(resetEmail);
      
      if (result.success) {
        showSuccess("📧 Reset link sent! Check your email for instructions.");
        toast({
          title: "Reset link sent!",
          description: "Check your email for password reset instructions.",
        });
        setShowResetForm(false);
        setResetEmail("");
      } else {
        showError(result.error || "Password reset failed");
      }
    } catch (error) {
      showError("🌐 An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminSetup = async () => {
    setSetupLoading(true);
    clearMessages();

    try {
      const { data, error } = await supabase.functions.invoke("setup-super-admin");

      if (error) {
        throw error;
      }

      if (data.success) {
        showSuccess("✅ Super admin account created! You can now sign in with edward@shogunaillc.com");
        setShowSetupButton(false);
        toast({
          title: "Setup Complete!",
          description: "Super admin account is ready. You can now sign in.",
        });
      } else {
        showError(data.message || "Setup failed");
      }
    } catch (error: any) {
      console.error("Super admin setup error:", error);
      showError("Setup failed: " + (error.message || "Unknown error"));
    } finally {
      setSetupLoading(false);
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

                {(error || successMessage) && (
                  <Alert variant={error ? "destructive" : "default"} className={successMessage ? "border-green-200 bg-green-50 text-green-800" : ""}>
                    <AlertDescription>
                      {error || successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading || !resetEmail.trim() || isRateLimited}
                    className="flex-1"
                  >
                    {loading ? "Sending..." : isRateLimited ? "Please wait..." : "Send Reset Link"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowResetForm(false);
                      clearMessages();
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

                    {(error || successMessage) && (
                      <Alert variant={error ? "destructive" : "default"} className={successMessage ? "border-green-200 bg-green-50 text-green-800" : ""}>
                        <AlertDescription>{error || successMessage}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !loginEmail.trim() || !loginPassword.trim() || isRateLimited}
                    >
                      {loading ? "Signing in..." : isRateLimited ? "Please wait..." : "Sign In"}
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
                        placeholder="Enter your work email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="signupPhone">Phone Number</Label>
                      <Input
                        id="signupPhone"
                        type="tel"
                        placeholder="Phone Number (optional)"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="signupCompany">Company/Organization</Label>
                      <Input
                        id="signupCompany"
                        type="text"
                        placeholder="Enter your company or organization"
                        value={signupCompany}
                        onChange={(e) => setSignupCompany(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signupPurpose">Purpose</Label>
                      <Textarea
                        id="signupPurpose"
                        placeholder="Briefly explain your role and how you plan to use Asset Guardian"
                        value={signupPurpose}
                        onChange={(e) => setSignupPurpose(e.target.value)}
                        required
                        disabled={loading}
                        className="min-h-[80px] resize-none"
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

                    {(error || successMessage) && (
                      <Alert variant={error ? "destructive" : "default"} className={successMessage ? "border-green-200 bg-green-50 text-green-800" : ""}>
                        <AlertDescription>{error || successMessage}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !signupEmail.trim() || !signupPassword.trim() || !signupCompany.trim() || !signupPurpose.trim() || isRateLimited}
                    >
                      {loading ? "Creating account..." : isRateLimited ? "Please wait..." : "Create Account"}
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

        {/* Super Admin Setup */}
        {showSetupButton && (
          <div className="text-center pt-4 border-t border-border">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                System Setup Required
              </p>
              <Button
                onClick={handleSuperAdminSetup}
                disabled={setupLoading}
                variant="outline"
                size="sm"
              >
                {setupLoading ? "Setting up..." : "Setup Super Admin"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;