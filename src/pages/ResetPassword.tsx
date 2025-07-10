import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenVerified, setTokenVerified] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      console.log('Reset password URL params:', { tokenHash, type });
      
      if (!tokenHash || type !== 'recovery') {
        console.error('Missing or invalid token parameters');
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or expired.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        // Verify the reset token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        console.log('Token verification result:', { data, error });

        if (error) {
          console.error('Token verification failed:', error);
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or expired.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        if (data.user) {
          console.log('Token verified successfully for user:', data.user.email);
          setTokenVerified(true);
        }
      } catch (err) {
        console.error('Token verification error:', err);
        toast({
          title: "Error",
          description: "Failed to verify reset token. Please try again.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    verifyToken();
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tokenVerified) {
      setError("Reset token not verified. Please use a valid reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Update the password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message || "Failed to update password");
        return;
      }

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated. You can now sign in.",
      });
      
      // Sign out to ensure clean state and redirect to auth
      await supabase.auth.signOut();
      navigate("/auth");
      
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="Asset Guardian Logo" 
              className="h-16 w-16 mx-auto mb-4" 
            />
            <h1 className="text-2xl font-bold text-foreground">Asset Guardian</h1>
            <p className="text-muted-foreground">Verifying reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center">
          <img 
            src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
            alt="Asset Guardian Logo" 
            className="h-16 w-16 mx-auto mb-4" 
          />
          <h1 className="text-2xl font-bold text-foreground">Asset Guardian</h1>
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
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
                disabled={loading || !password.trim() || !confirmPassword.trim()}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;