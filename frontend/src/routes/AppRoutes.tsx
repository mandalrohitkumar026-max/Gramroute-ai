import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { FeaturesPage } from '../pages/public/FeaturesPage';
import { ForFarmersPage } from '../pages/public/ForFarmersPage';
import { ForTransportersPage } from '../pages/public/ForTransportersPage';
import { ForBusinessesPage } from '../pages/public/ForBusinessesPage';
import { ContactPage } from '../pages/public/ContactPage';
import { FaqPage } from '../pages/public/FaqPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Farmer Dashboard Pages
import { FarmerOverview } from '../pages/dashboard/farmer/FarmerOverview';
import { CreateShipmentPage } from '../pages/dashboard/farmer/CreateShipmentPage';
import { MyShipmentsPage } from '../pages/dashboard/farmer/MyShipmentsPage';
import { AvailableTripsPage } from '../pages/dashboard/farmer/AvailableTripsPage';
import { BookingHistoryPage } from '../pages/dashboard/farmer/BookingHistoryPage';
import { TrackingPage } from '../pages/dashboard/farmer/TrackingPage';
import { FarmerNotificationsPage } from '../pages/dashboard/farmer/FarmerNotificationsPage';
import { ProfileVerificationPage } from '../pages/dashboard/farmer/ProfileVerificationPage';

// Business Dashboard Pages
import { BusinessOverview } from '../pages/dashboard/business/BusinessOverview';
import { ShipmentManagementPage } from '../pages/dashboard/business/ShipmentManagementPage';
import { BulkShipmentPage } from '../pages/dashboard/business/BulkShipmentPage';
import { BusinessBookingsPage } from '../pages/dashboard/business/BusinessBookingsPage';
import { TransporterDiscoveryPage } from '../pages/dashboard/business/TransporterDiscoveryPage';
import { DeliveryTrackingPage } from '../pages/dashboard/business/DeliveryTrackingPage';
import { ReportsPage } from '../pages/dashboard/business/ReportsPage';

// Transporter Dashboard Pages
import { TransporterOverview } from '../pages/dashboard/transporter/TransporterOverview';
import { VehicleManagementPage } from '../pages/dashboard/transporter/VehicleManagementPage';
import { AvailabilityCalendarPage } from '../pages/dashboard/transporter/AvailabilityCalendarPage';
import { ShipmentOpportunitiesPage } from '../pages/dashboard/transporter/ShipmentOpportunitiesPage';
import { TripManagementPage } from '../pages/dashboard/transporter/TripManagementPage';
import { EarningsPage } from '../pages/dashboard/transporter/EarningsPage';
import { PerformanceRatingsPage } from '../pages/dashboard/transporter/PerformanceRatingsPage';

// Admin Dashboard Pages
import { AdminOverview } from '../pages/dashboard/admin/AdminOverview';
import { UserManagementPage } from '../pages/dashboard/admin/UserManagementPage';
import { AdminShipmentManagementPage } from '../pages/dashboard/admin/AdminShipmentManagementPage';
import { VehicleVerificationPage } from '../pages/dashboard/admin/VehicleVerificationPage';
import { TripMonitoringPage } from '../pages/dashboard/admin/TripMonitoringPage';
import { DisputesPage } from '../pages/dashboard/admin/DisputesPage';
import { AdminAnalyticsPage } from '../pages/dashboard/admin/AdminAnalyticsPage';
import { SystemConfigPage } from '../pages/dashboard/admin/SystemConfigPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 10 Public Pages */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
      <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
      <Route path="/for-farmers" element={<PublicLayout><ForFarmersPage /></PublicLayout>} />
      <Route path="/for-transporters" element={<PublicLayout><ForTransportersPage /></PublicLayout>} />
      <Route path="/for-businesses" element={<PublicLayout><ForBusinessesPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FaqPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />

      {/* Role A: Farmer Dashboard */}
      <Route path="/dashboard/farmer" element={<DashboardLayout><FarmerOverview /></DashboardLayout>} />
      <Route path="/dashboard/farmer/create-shipment" element={<DashboardLayout><CreateShipmentPage /></DashboardLayout>} />
      <Route path="/dashboard/farmer/shipments" element={<DashboardLayout><MyShipmentsPage /></DashboardLayout>} />
      <Route path="/dashboard/farmer/available-trips" element={<DashboardLayout><AvailableTripsPage /></DashboardLayout>} />
      <Route path="/dashboard/farmer/bookings" element={<DashboardLayout><BookingHistoryPage /></DashboardLayout>} />
      <Route path="/dashboard/farmer/tracking" element={<DashboardLayout><TrackingPage /></DashboardLayout>} />
      <Route path="/dashboard/farmer/notifications" element={<DashboardLayout><FarmerNotificationsPage /></DashboardLayout>} />
      <Route path="/dashboard/farmer/profile" element={<DashboardLayout><ProfileVerificationPage /></DashboardLayout>} />

      {/* Role B: Business Dashboard */}
      <Route path="/dashboard/business" element={<DashboardLayout><BusinessOverview /></DashboardLayout>} />
      <Route path="/dashboard/business/shipments" element={<DashboardLayout><ShipmentManagementPage /></DashboardLayout>} />
      <Route path="/dashboard/business/bulk-create" element={<DashboardLayout><BulkShipmentPage /></DashboardLayout>} />
      <Route path="/dashboard/business/bookings" element={<DashboardLayout><BusinessBookingsPage /></DashboardLayout>} />
      <Route path="/dashboard/business/transporters" element={<DashboardLayout><TransporterDiscoveryPage /></DashboardLayout>} />
      <Route path="/dashboard/business/tracking" element={<DashboardLayout><DeliveryTrackingPage /></DashboardLayout>} />
      <Route path="/dashboard/business/reports" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />

      {/* Role C: Transporter Dashboard */}
      <Route path="/dashboard/transporter" element={<DashboardLayout><TransporterOverview /></DashboardLayout>} />
      <Route path="/dashboard/transporter/vehicles" element={<DashboardLayout><VehicleManagementPage /></DashboardLayout>} />
      <Route path="/dashboard/transporter/calendar" element={<DashboardLayout><AvailabilityCalendarPage /></DashboardLayout>} />
      <Route path="/dashboard/transporter/opportunities" element={<DashboardLayout><ShipmentOpportunitiesPage /></DashboardLayout>} />
      <Route path="/dashboard/transporter/trips" element={<DashboardLayout><TripManagementPage /></DashboardLayout>} />
      <Route path="/dashboard/transporter/earnings" element={<DashboardLayout><EarningsPage /></DashboardLayout>} />
      <Route path="/dashboard/transporter/ratings" element={<DashboardLayout><PerformanceRatingsPage /></DashboardLayout>} />

      {/* Role D: Admin Dashboard */}
      <Route path="/dashboard/admin" element={<DashboardLayout><AdminOverview /></DashboardLayout>} />
      <Route path="/dashboard/admin/users" element={<DashboardLayout><UserManagementPage /></DashboardLayout>} />
      <Route path="/dashboard/admin/shipments" element={<DashboardLayout><AdminShipmentManagementPage /></DashboardLayout>} />
      <Route path="/dashboard/admin/verifications" element={<DashboardLayout><VehicleVerificationPage /></DashboardLayout>} />
      <Route path="/dashboard/admin/monitoring" element={<DashboardLayout><TripMonitoringPage /></DashboardLayout>} />
      <Route path="/dashboard/admin/disputes" element={<DashboardLayout><DisputesPage /></DashboardLayout>} />
      <Route path="/dashboard/admin/analytics" element={<DashboardLayout><AdminAnalyticsPage /></DashboardLayout>} />
      <Route path="/dashboard/admin/config" element={<DashboardLayout><SystemConfigPage /></DashboardLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
