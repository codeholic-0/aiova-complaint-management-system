import Badge from "../common/Badge";

export default function CopilotHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">AI Complaint Intake Assistant</h2>
      <Badge color="yellow">BETA</Badge>
    </div>
  );
}
