
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterChangesList from "@/components/filter/FilterChangesList";
import FilterChangeFormDialog from "@/components/filter/FilterChangeFormDialog";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const FilterChanges = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in pb-16">
        <div className={`flex flex-col ${isMobile ? 'gap-3' : 'md:flex-row'} justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-lg shadow-sm`}>
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600`}>
              Filter Changes
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Track and manage HVAC filter replacements
            </p>
          </div>
          
          <Button 
            onClick={() => setShowAddDialog(true)}
            className={`${isMobile ? 'w-full py-2 text-sm' : ''} bg-[#1EAEDB] hover:bg-[#33C3F0] text-white shadow transition-all duration-200`}
            size={isMobile ? "default" : "lg"}
          >
            <Plus className={`${isMobile ? 'mr-1 h-4 w-4' : 'mr-2 h-5 w-5'}`} /> New Filter Change
          </Button>
        </div>

        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All Filters</TabsTrigger>
            <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
            <TabsTrigger value="overdue" className="flex-1">Overdue</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <FilterChangesList />
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* TODO: Add filter for active status */}
              <FilterChangesList />
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* TODO: Add filter for overdue status */}
              <FilterChangesList />
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* TODO: Add filter for completed status */}
              <FilterChangesList />
            </div>
          </TabsContent>
        </Tabs>

        <FilterChangeFormDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      </div>
    </Layout>
  );
};

export default FilterChanges;
