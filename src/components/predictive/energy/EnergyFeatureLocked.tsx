import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Brain, Zap, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AIFeatureService } from '@/services/aiFeatureService';
import { useToast } from '@/hooks/use-toast';

interface EnergyFeatureLockedProps {
  equipmentName: string;
}

const EnergyFeatureLocked = ({ equipmentName }: EnergyFeatureLockedProps) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestAccess = async () => {
    if (!user || !userProfile || !justification.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a justification for your access request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userName = userProfile.first_name && userProfile.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : userProfile.email.split('@')[0];

      const result = await AIFeatureService.requestAccess(
        user.id,
        userProfile.email,
        userName,
        justification
      );

      if (result.success) {
        toast({
          title: "Access Request Submitted",
          description: "Your request has been sent to the administrators for review.",
        });
        setShowRequestForm(false);
        setJustification('');
      } else {
        toast({
          title: "Request Failed",
          description: result.error || "Failed to submit access request.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting access request:', error);
      toast({
        title: "Request Failed",
        description: "An error occurred while submitting your request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Lock Screen */}
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl">Dual-AI Energy Dashboard</CardTitle>
          <CardDescription className="text-base">
            Advanced energy optimization powered by dual AI analysis for {equipmentName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Real-time Analysis</span>
              </div>
              <p className="text-sm text-blue-700">
                Continuous monitoring with instant optimization recommendations
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Predictive Insights</span>
              </div>
              <p className="text-sm text-green-700">
                Advanced forecasting for maintenance and energy efficiency
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Dual AI Engine</span>
              </div>
              <p className="text-sm text-purple-700">
                Multiple AI models working together for superior accuracy
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What you'll get with access:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-sm">Advanced energy consumption analysis with multiple AI perspectives</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-sm">Predictive maintenance recommendations to prevent failures</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-sm">Real-time cost optimization and savings identification</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-sm">Intelligent chat interface for equipment insights</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4 pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Administrator approval required</span>
            </div>
            
            {!showRequestForm ? (
              <Button 
                onClick={() => setShowRequestForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                Request Access
              </Button>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Justification for access:</label>
                  <Textarea
                    placeholder="Please explain why you need access to the dual-AI energy dashboard..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRequestAccess}
                    disabled={!justification.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRequestForm(false);
                      setJustification('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">About Dual-AI Energy Analysis</p>
              <p className="text-sm text-muted-foreground">
                This premium feature uses advanced machine learning models to provide deeper insights 
                into your equipment's energy performance. Access is controlled to ensure responsible 
                usage and cost management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyFeatureLocked;