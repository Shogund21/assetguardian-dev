
import React from "react";
import OpenAIKeyManager from "../ai/OpenAIKeyManager";

const AIIntegrationSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">AI Integration</h3>
        <p className="text-sm text-muted-foreground">
          Configure AI services for predictive maintenance analysis
        </p>
      </div>
      <OpenAIKeyManager />
    </div>
  );
};

export default AIIntegrationSection;
