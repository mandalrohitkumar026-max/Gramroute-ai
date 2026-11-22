import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../src/models/User';
import { Profile } from '../src/models/Profile';
import { Vehicle } from '../src/models/Vehicle';
import { Shipment } from '../src/models/Shipment';
import { Trip } from '../src/models/Trip';
import { TripStop } from '../src/models/TripStop';
import { Booking } from '../src/models/Booking';
import { CostAllocation } from '../src/models/CostAllocation';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gramroute_ai';

export const seedDatabase = async (): Promise<void> => {
  console.log('🌱 Starting GramRoute AI Database Seed...');
  console.log(`Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);

  try {
    // 1. Password hash generation
    const salt = await bcrypt.genSalt(10);
    const farmerPasswordHash = await bcrypt.hash('Farmer@1234', salt);
    const transporterPasswordHash = await bcrypt.hash('Transporter@1234', salt);
    const adminPasswordHash = await bcrypt.hash('Admin@1234', salt);
    const businessPasswordHash = await bcrypt.hash('Business@1234', salt);

    // 2. Upsert Users
    console.log('Upserting core demo users...');

    const farmerUser = await User.findOneAndUpdate(
      { email: 'farmer@gramroute.ai' },
      {
        phoneNumber: '+919876543210',
        email: 'farmer@gramroute.ai',
        passwordHash: farmerPasswordHash,
        role: 'FARMER',
        status: 'ACTIVE',
        isPhoneVerified: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        preferredLanguage: 'hi'
      },
      { upsert: true, new: true }
    );

    const transporterUser = await User.findOneAndUpdate(
      { email: 'transporter@gramroute.ai' },
      {
        phoneNumber: '+919876543211',
        email: 'transporter@gramroute.ai',
        passwordHash: transporterPasswordHash,
        role: 'TRANSPORTER',
        status: 'ACTIVE',
        isPhoneVerified: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        preferredLanguage: 'hi'
      },
      { upsert: true, new: true }
    );

    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@gramroute.ai' },
      {
        phoneNumber: '+919876543212',
        email: 'admin@gramroute.ai',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        isPhoneVerified: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        preferredLanguage: 'en'
      },
      { upsert: true, new: true }
    );

    const businessUser = await User.findOneAndUpdate(
      { email: 'business@gramroute.ai' },
      {
        phoneNumber: '+919876543213',
        email: 'business@gramroute.ai',
        passwordHash: businessPasswordHash,
        role: 'BUSINESS',
        status: 'ACTIVE',
        isPhoneVerified: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        preferredLanguage: 'gu'
      },
      { upsert: true, new: true }
    );

    // 3. Upsert User Profiles
    console.log('Upserting user profiles with 2dsphere coordinates...');

    await Profile.findOneAndUpdate(
      { userId: farmerUser._id },
      {
        userId: farmerUser._id,
        fullName: 'Ramesh Patel',
        businessName: 'Kisan Krishi Farm FPO',
        address: 'Village Ashta, Farm Plot 14',
        villageOrTown: 'Ashta',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        pincode: '466116',
        location: {
          type: 'Point',
          coordinates: [76.5367, 23.0182] // [lng, lat]
        },
        ratingAverage: 4.8,
        totalRatingsCount: 14
      },
      { upsert: true }
    );

    await Profile.findOneAndUpdate(
      { userId: transporterUser._id },
      {
        userId: transporterUser._id,
        fullName: 'Baldev Singh Logistics',
        businessName: 'Malwa Kisan Express',
        address: 'Truck Stand, Old Indore-Bhopal Bypass',
        villageOrTown: 'Sehore',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        pincode: '466001',
        location: {
          type: 'Point',
          coordinates: [77.0851, 23.2033] // [lng, lat]
        },
        ratingAverage: 4.9,
        totalRatingsCount: 28
      },
      { upsert: true }
    );

    // 4. Upsert Transporter Fleet
    console.log('Upserting transporter vehicles...');

    const boleroTruck = await Vehicle.findOneAndUpdate(
      { registrationNumber: 'MP-04-TA-5521' },
      {
        transporterId: transporterUser._id,
        registrationNumber: 'MP-04-TA-5521',
        vehicleType: 'PICKUP_TRUCK',
        vehicleCategory: 'TARPAULIN',
        makeAndModel: 'Mahindra Bolero Maxi Truck Plus',
        yearOfManufacture: 2022,
        payloadCapacityKg: 1700,
        volumetricCapacityCubicMeters: 6.2,
        dimensions: { lengthM: 2.5, widthM: 1.6, heightM: 1.5 },
        hasRefrigeration: false,
        hasTarpaulinCover: true,
        permitType: 'STATE',
        verificationStatus: 'VERIFIED',
        isAvailable: true,
        availabilityStatus: 'AVAILABLE',
        operatingAreas: ['Sehore', 'Bhopal', 'Dewas', 'Indore'],
        isActive: true,
        currentLocation: {
          type: 'Point',
          coordinates: [76.5367, 23.0182],
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // 5. Upsert Sample Agricultural Shipments
    console.log('Upserting sample agricultural shipments...');

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const tomatoShipment = await Shipment.findOneAndUpdate(
      { cargoName: 'Fresh Hybrid Tomatoes' },
      {
        shipperId: farmerUser._id,
        cargoName: 'Fresh Hybrid Tomatoes',
        cargoDescription: '25 crates of freshly harvested farm-grade tomatoes',
        cargoCategory: 'Vegetables',
        perishability: 'HIGHLY_PERISHABLE',
        isPerishable: true,
        weightKg: 500,
        volumeCubicMeters: 1.8,
        numberOfPackages: 25,
        packagingType: 'Crates',
        isStackable: true,
        temperatureControlRequired: false,
        handlingRequirements: ['Fragile', 'Keep Ventilated'],
        origin: {
          address: 'Kisan Krishi Farm, Village Ashta',
          villageOrTown: 'Ashta',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          pincode: '466116',
          location: {
            type: 'Point',
            coordinates: [76.5367, 23.0182]
          }
        },
        destination: {
          address: 'Krishi Upaj Mandi, Platform No. 3',
          mandiOrMarketName: 'Sehore APMC Mandi',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          pincode: '466001',
          location: {
            type: 'Point',
            coordinates: [77.0851, 23.2033]
          }
        },
        pickupWindowStart: tomorrow,
        deliveryWindowEnd: dayAfter,
        maxBudgetInr: 2500,
        status: 'MATCHED'
      },
      { upsert: true, new: true }
    );

    // 6. Upsert Scheduled Consolidated Trip
    console.log('Upserting scheduled trip with waypoints...');

    const sampleTrip = await Trip.findOneAndUpdate(
      { routeSummary: 'Ashta Mandi Hub -> Sehore Central APMC' },
      {
        transporterId: transporterUser._id,
        vehicleId: boleroTruck._id,
        routeSummary: 'Ashta Mandi Hub -> Sehore Central APMC',
        origin: {
          address: 'Ashta Transporter Hub',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          location: { type: 'Point', coordinates: [76.5367, 23.0182] }
        },
        destination: {
          address: 'Sehore Central APMC Mandi',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          location: { type: 'Point', coordinates: [77.0851, 23.2033] }
        },
        departureTime: tomorrow,
        estimatedArrivalTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        totalDistanceKm: 48.5,
        totalEstimatedFuelCost: 650,
        totalAgreedEarnings: 2200,
        allocatedWeightKg: 500,
        remainingCapacityKg: 1200,
        remainingVolumeCbm: 4.4,
        isPublished: true,
        operatingCorridors: ['Ashta-Sehore', 'Indore-Bhopal'],
        status: 'PLANNED',
        isBackhaulTrip: false
      },
      { upsert: true, new: true }
    );

    // 7. Upsert TripStops
    await TripStop.deleteMany({ tripId: sampleTrip._id });
    await TripStop.create([
      {
        tripId: sampleTrip._id,
        shipmentId: tomatoShipment._id,
        stopSequenceOrder: 1,
        stopType: 'PICKUP',
        location: {
          address: 'Kisan Krishi Farm, Village Ashta',
          coordinates: [76.5367, 23.0182]
        },
        contactPersonName: 'Ramesh Patel',
        contactPhoneNumber: '+919876543210',
        scheduledArrivalTime: tomorrow,
        stopDwellMinutes: 20,
        weightHandledKg: 500,
        otpVerificationCode: '4821',
        status: 'PENDING'
      },
      {
        tripId: sampleTrip._id,
        shipmentId: tomatoShipment._id,
        stopSequenceOrder: 2,
        stopType: 'DROP',
        location: {
          address: 'Krishi Upaj Mandi, Platform No. 3, Sehore',
          coordinates: [77.0851, 23.2033]
        },
        contactPersonName: 'Mandi Commission Agent',
        contactPhoneNumber: '+919876543299',
        scheduledArrivalTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        stopDwellMinutes: 30,
        weightHandledKg: 500,
        otpVerificationCode: '9134',
        status: 'PENDING'
      }
    ]);

    // 8. Upsert Booking & Cost Allocation
    const sampleBooking = await Booking.findOneAndUpdate(
      { bookingReference: 'BK-202611-ASTA' },
      {
        bookingReference: 'BK-202611-ASTA',
        shipmentId: tomatoShipment._id,
        tripId: sampleTrip._id,
        shipperId: farmerUser._id,
        transporterId: transporterUser._id,
        totalAgreedAmountInr: 1850,
        allocatedWeightKg: 500,
        pickupOtp: '4821',
        deliveryOtp: '9134',
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'ESCROWED',
        acceptedByCustomerAt: new Date(),
        acceptedByTransporterAt: new Date()
      },
      { upsert: true, new: true }
    );

    await CostAllocation.findOneAndUpdate(
      { bookingId: sampleBooking._id },
      {
        bookingId: sampleBooking._id,
        tripId: sampleTrip._id,
        baseHaulageCostInr: 1400,
        fuelSurchargeInr: 250,
        tollChargesInr: 50,
        stopHandlingFeeInr: 150,
        distanceKm: 48.5,
        tonKmCost: 76.28,
        soloTripBenchmarkInr: 2500,
        consolidationDiscountInr: 650, // 26% saving for the farmer
        platformFeeInr: 50,
        finalShipperPayableInr: 1850,
        transporterNetReceivableInr: 1800,
        isPaid: true
      },
      { upsert: true }
    );

    console.log('✅ Seed completed successfully!');
    console.log('────────────────────────────────────────');
    console.log('Demo Users Available:');
    console.log('  🧑‍🌾 Farmer:      farmer@gramroute.ai      / Farmer@1234');
    console.log('  🚛 Transporter: transporter@gramroute.ai / Transporter@1234');
    console.log('  🛡️ Admin:       admin@gramroute.ai       / Admin@1234');
    console.log('  🏢 Business:    business@gramroute.ai    / Business@1234');
    console.log('────────────────────────────────────────');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Execute if run directly from CLI
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
