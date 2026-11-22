import { runPerishableCargoJob } from '../jobs/perishableCargoJob';
import { runStaleLocationJob } from '../jobs/staleLocationJob';
import { runConsolidationSweeperJob } from '../jobs/consolidationSweeperJob';
import { runEscrowReconciliationJob } from '../jobs/escrowReconciliationJob';
import { runAllJobsNow } from '../jobs';

// Mock models and dependencies
jest.mock('../models/Shipment', () => ({
  Shipment: {
    find: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([])
    })
  }
}));

jest.mock('../models/Trip', () => ({
  Trip: {
    find: jest.fn().mockResolvedValue([]),
    countDocuments: jest.fn().mockResolvedValue(0)
  }
}));

jest.mock('../models/Booking', () => ({
  Booking: {
    find: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../models/Dispute', () => ({
  Dispute: {
    findOne: jest.fn().mockResolvedValue(null)
  }
}));

jest.mock('../services/notificationService', () => ({
  notificationService: {
    notify: jest.fn().mockResolvedValue({})
  }
}));

jest.mock('../services/websocketService', () => ({
  websocketService: {
    broadcastToTrip: jest.fn()
  }
}));

describe('GramRoute AI Background Jobs Suite', () => {
  it('runPerishableCargoJob completes gracefully when no shipments are decaying', async () => {
    const report = await runPerishableCargoJob();
    expect(report).toBeDefined();
    expect(report.checked).toBe(0);
    expect(report.alerted).toBe(0);
    expect(report.expired).toBe(0);
  });

  it('runStaleLocationJob completes gracefully with no active stale trips', async () => {
    const report = await runStaleLocationJob();
    expect(report).toBeDefined();
    expect(report.checked).toBe(0);
    expect(report.staleCount).toBe(0);
  });

  it('runConsolidationSweeperJob skips evaluation when no candidate trips or shipments exist', async () => {
    const report = await runConsolidationSweeperJob();
    expect(report).toBeDefined();
    expect(report.shipmentsEvaluated).toBe(0);
    expect(report.matchesCreated).toBe(0);
  });

  it('runEscrowReconciliationJob completes gracefully with zero delivered bookings', async () => {
    const report = await runEscrowReconciliationJob();
    expect(report).toBeDefined();
    expect(report.eligible).toBe(0);
    expect(report.disbursed).toBe(0);
  });

  it('runAllJobsNow coordinates manual sweep of all background jobs', async () => {
    const report = await runAllJobsNow();
    expect(report).toBeDefined();
    expect(report.timestamp).toBeDefined();
    expect(report.perishableCargo).toBeDefined();
    expect(report.staleLocation).toBeDefined();
    expect(report.consolidationSweeper).toBeDefined();
    expect(report.escrowReconciliation).toBeDefined();
  });
});
