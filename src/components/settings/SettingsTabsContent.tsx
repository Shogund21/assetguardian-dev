
import { TabsContent } from "@/components/ui/tabs";
import { GeneralSection } from "./sections/GeneralSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { LocationsSection } from "./sections/LocationsSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { MaintenanceSection } from "./sections/MaintenanceSection";
import { DocumentationSection } from "./sections/DocumentationSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { CompaniesSection } from "./sections/CompaniesSection";
import { AuditSection } from "./sections/AuditSection";
import { UserMetricsSection } from "./sections/UserMetricsSection";
import AccessRequestManagement from "./access/AccessRequestManagement";
import SuperAdminSetup from "./admin/SuperAdminSetup";
import SuperAdminAIManagement from "../admin/SuperAdminAIManagement";
import RateLimitManagement from "@/components/admin/RateLimitManagement";
import PrintSettingsTab from "./PrintSettingsTab";
import { useAuth } from "@/hooks/useAuth";

const ErrorFallback = ({ sectionName }: { sectionName: string }) => (
  <div className="p-4 text-center text-muted-foreground">
    <p>Unable to load {sectionName} section.</p>
    <p className="text-sm">Please refresh the page or try again later.</p>
  </div>
);

const SectionWrapper = ({ children, sectionName }: { children: React.ReactNode; sectionName: string }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`Error in ${sectionName} section:`, error);
    return <ErrorFallback sectionName={sectionName} />;
  }
};

interface SettingsTabsContentProps {
  isMobile: boolean;
  isDemoUser?: boolean;
}

const SettingsTabsContent = ({ isMobile, isDemoUser }: SettingsTabsContentProps) => {
  const { userProfile, isAdmin } = useAuth();
  const isAdminUser = isAdmin() || userProfile?.email === "edward@shogunaillc.com";
  const isSuperAdmin = userProfile?.email === "edward@shogunaillc.com";
  
  return (
    <div className="mt-0">
      {isDemoUser && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Demo Mode Active</h3>
              <p className="text-sm text-blue-700 mb-3">
                You're exploring Asset Guardian with sample data. Some settings are limited in demo mode.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Create Your Company Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      <TabsContent value="general" className="mt-0">
        <SuperAdminSetup />
        <SectionWrapper sectionName="General">
          <GeneralSection />
        </SectionWrapper>
      </TabsContent>
      <TabsContent value="appearance" className="mt-0">
        <SectionWrapper sectionName="Appearance">
          <AppearanceSection />
        </SectionWrapper>
      </TabsContent>
      <TabsContent value="documentation" className="mt-0">
        <SectionWrapper sectionName="Documentation">
            <DocumentationSection />
          </SectionWrapper>
        </TabsContent>

        <TabsContent value="print" className="mt-0">
          <SectionWrapper sectionName="Print & Export">
            <PrintSettingsTab />
          </SectionWrapper>
        </TabsContent>
      
      {!isDemoUser && (
        <>
          <TabsContent value="notifications" className="mt-0">
            <SectionWrapper sectionName="Notifications">
              <NotificationsSection />
            </SectionWrapper>
          </TabsContent>
          <TabsContent value="locations" className="mt-0">
            <SectionWrapper sectionName="Locations">
              <LocationsSection />
            </SectionWrapper>
          </TabsContent>
          <TabsContent value="companies" className="mt-0">
            <SectionWrapper sectionName="Companies">
              <CompaniesSection />
            </SectionWrapper>
          </TabsContent>
          <TabsContent value="features" className="mt-0">
            <SectionWrapper sectionName="Features">
              <FeaturesSection />
            </SectionWrapper>
          </TabsContent>
          <TabsContent value="maintenance" className="mt-0">
            <SectionWrapper sectionName="Maintenance">
              <MaintenanceSection />
            </SectionWrapper>
          </TabsContent>
          <TabsContent value="audit" className="mt-0">
            <SectionWrapper sectionName="Audit">
              <AuditSection />
            </SectionWrapper>
          </TabsContent>
          <TabsContent value="user-metrics" className="mt-0">
            <SectionWrapper sectionName="User Metrics">
              <UserMetricsSection />
            </SectionWrapper>
          </TabsContent>
          {isAdminUser && (
            <>
              <TabsContent value="access-requests" className="mt-0">
                <SectionWrapper sectionName="Access Requests">
                  <AccessRequestManagement />
                </SectionWrapper>
              </TabsContent>
              <TabsContent value="ai-management" className="mt-0">
                <SectionWrapper sectionName="AI Management">
                  <SuperAdminAIManagement />
                </SectionWrapper>
              </TabsContent>
            </>
          )}
          {isSuperAdmin && (
            <TabsContent value="rate-limits" className="mt-0">
              <SectionWrapper sectionName="Rate Limits">
                <RateLimitManagement />
              </SectionWrapper>
            </TabsContent>
          )}
        </>
      )}
    </div>
  );
};

export default SettingsTabsContent;
