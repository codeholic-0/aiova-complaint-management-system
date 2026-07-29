import FormHeader from "./components/ComplaintForm/FormHeader";
import OriginSection from "./components/ComplaintForm/OriginSection";
import ProductSection from "./components/ComplaintForm/ProductSection";
import DetailsSection from "./components/ComplaintForm/DetailsSection";
import AssessmentSection from "./components/ComplaintForm/AssessmentSection";
import FormActions from "./components/ComplaintForm/FormActions";
import CopilotHeader from "./components/Copilot/CopilotHeader";
import ExtractionProgress from "./components/Copilot/ExtractionProgress";
import ChatWindow from "./components/Copilot/ChatWindow";
import ChatInput from "./components/Copilot/ChatInput";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <FormHeader />
          <div className="space-y-4">
            <OriginSection />
            <ProductSection />
            <DetailsSection />
            <AssessmentSection />
          </div>
          <FormActions />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
          <CopilotHeader />
          <ExtractionProgress />
          <div className="flex-1 mt-4">
            <ChatWindow />
          </div>
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
