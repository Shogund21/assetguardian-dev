
import { Wifi, WifiOff, Upload, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export const OfflineIndicator = () => {
  const { isOnline, isSyncing, unsyncedCount, syncOfflineData } = useOfflineSync();

  if (isOnline && unsyncedCount === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Wifi className="h-4 w-4" />
        <span className="text-sm font-medium">Online</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-900">Offline Mode</div>
              {unsyncedCount > 0 && (
                <div className="text-xs text-orange-700">
                  {unsyncedCount} reading{unsyncedCount !== 1 ? 's' : ''} pending sync
                </div>
              )}
            </div>
            {unsyncedCount > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {unsyncedCount}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isOnline && unsyncedCount > 0) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <Upload className="h-4 w-4 text-blue-600 animate-pulse" />
            ) : (
              <AlertCircle className="h-4 w-4 text-blue-600" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                {isSyncing ? 'Syncing...' : 'Sync Pending'}
              </div>
              <div className="text-xs text-blue-700">
                {unsyncedCount} reading{unsyncedCount !== 1 ? 's' : ''} to sync
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {unsyncedCount}
              </Badge>
              {!isSyncing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={syncOfflineData}
                  className="text-xs h-6 px-2"
                >
                  Sync Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
