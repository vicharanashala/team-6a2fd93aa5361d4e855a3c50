'use client';

interface StatusTrackerProps {
  status: 'active' | 'in-review' | 'resolved';
  approvals?: number;
  requiredApprovals?: number;
}

export default function StatusTracker({ status, approvals = 0, requiredApprovals = 3 }: StatusTrackerProps) {
  const steps = [
    { key: 'active', label: 'Active', icon: '📝' },
    { key: 'in-review', label: 'In Review', icon: '🔍' },
    { key: 'resolved', label: 'Resolved', icon: '✅' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="status-tracker" id="status-tracker">
      {steps.map((step, index) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className={`status-step ${
              index < currentIndex ? 'completed' : index === currentIndex ? 'current' : ''
            }`}
          >
            <div className="status-step-circle">
              {index < currentIndex ? '✓' : step.icon}
            </div>
            <span className="status-step-label">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`status-connector ${index < currentIndex ? 'completed' : ''}`}
            />
          )}
        </div>
      ))}
      {status === 'in-review' && (
        <div style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)' }}>
          <span className="approval-text">
            {approvals} / {requiredApprovals} approvals
          </span>
        </div>
      )}
    </div>
  );
}
