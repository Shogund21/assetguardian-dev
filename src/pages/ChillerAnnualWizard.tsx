import { ChillerInspectionWizard } from '@/components/chiller-annuals/wizard/ChillerInspectionWizard';
import { useSearchParams } from 'react-router-dom';

export default function ChillerAnnualWizard() {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft') || undefined;

  return <ChillerInspectionWizard draftId={draftId} />;
}
