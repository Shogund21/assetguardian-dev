import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationList } from "../location/LocationList";
import { ChillerRiskRanking } from "@/components/equipment/ChillerRiskRanking";

export const LocationsSection = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Location Management</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Add, edit, and manage your locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationList />
        </CardContent>
      </Card>
      <ChillerRiskRanking />
    </div>
  );
};
