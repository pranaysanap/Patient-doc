/**
 * Script to check patients in MongoDB database
 * This will help us see what patients exist and their doctor assignments
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');

async function checkPatients() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all patients
        const allPatients = await Patient.find({});
        console.log(`📊 Total patients in database: ${allPatients.length}\n`);

        if (allPatients.length === 0) {
            console.log('⚠️  No patients found in database!');
            console.log('Patients need to sign up via OAuth in the patient dashboard.\n');
        } else {
            console.log('Patient Details:');
            console.log('================\n');

            allPatients.forEach((patient, index) => {
                console.log(`${index + 1}. Patient ID: ${patient.patientId}`);
                console.log(`   Name: ${patient.personalInfo.name}`);
                console.log(`   Email: ${patient.personalInfo.email}`);
                console.log(`   Doctor ID: ${patient.doctorId}`);
                console.log(`   Connection Status: ${patient.connectionStatus}`);
                console.log(`   Created: ${patient.createdAt}`);
                console.log('');
            });

            // Check which doctor ID they're assigned to
            const doctorGroups = {};
            allPatients.forEach(p => {
                if (!doctorGroups[p.doctorId]) {
                    doctorGroups[p.doctorId] = [];
                }
                doctorGroups[p.doctorId].push(p.personalInfo.name);
            });

            console.log('\nPatients grouped by Doctor ID:');
            console.log('================================');
            Object.keys(doctorGroups).forEach(doctorId => {
                console.log(`\nDoctor ID: ${doctorId}`);
                console.log(`Patients (${doctorGroups[doctorId].length}):`, doctorGroups[doctorId].join(', '));
            });

            console.log(`\n\n✅ Expected Doctor ID: ${process.env.DOCTOR_ID || 'dr_sujal_jadhav_001'}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPatients();
