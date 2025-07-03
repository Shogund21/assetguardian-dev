
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
import AccessRequestManagement from "./access/AccessRequestManagement";
import { checkAuthStatus } from "@/services/emailValidationService";

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
}

const SettingsTabsContent = ({ isMobile }: SettingsTabsContentProps) => {
  const authData = checkAuthStatus();
  const isAdminUser = authData.userData?.email === "edward@shogunai.com";
  
  return (
    <div className={`${isMobile ? 'mt-0' : 'mt-2'}`}>
      <TabsContent value="general" className="mt-0">
        <SectionWrapper sectionName="General">
          <GeneralSection />
        </SectionWrapper>
      </TabsContent>
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
      <TabsContent value="audit" className="mt-0">
        <SectionWrapper sectionName="Audit">
          <AuditSection />
        </SectionWrapper>
      </TabsContent>
      {isAdminUser && (
        <TabsContent value="access-requests" className="mt-0">
          <SectionWrapper sectionName="Access Requests">
            <AccessRequestManagement />
          </SectionWrapper>
        </TabsContent>
      )}
    </div>
  );
};

export default SettingsTabsContent;
