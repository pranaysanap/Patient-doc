/**
 * Database Initialization Script
 * Run this once to create the initial doctor account
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');

const initializeDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Check if doctor already exists
        const existingDoctor = await Doctor.findOne({
            doctorId: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001'
        });

        if (existingDoctor) {
            console.log('ℹ️  Doctor account already exists');
            console.log('Email:', existingDoctor.email);
            console.log('Username:', existingDoctor.username);

            // Update password if DOCTOR_PASSWORD_HASH is set
            if (process.env.DOCTOR_PASSWORD_HASH) {
                existingDoctor.passwordHash = process.env.DOCTOR_PASSWORD_HASH;
                await existingDoctor.save();
                console.log('✅ Password updated');
            }

            process.exit(0);
        }

        // Get password from environment or prompt
        const password = process.env.INIT_PASSWORD || 'admin123';
        const passwordHash = await bcrypt.hash(password, 10);

        // Create doctor account
        const doctor = await Doctor.create({
            doctorId: process.env.DOCTOR_ID || 'dr_sujal_jadhav_001',
            username: process.env.DOCTOR_USERNAME || 'dr.sujal',
            passwordHash: process.env.DOCTOR_PASSWORD_HASH || passwordHash,
            name: process.env.DOCTOR_NAME || 'Dr. Sujal Jadhav',
            email: process.env.DOCTOR_EMAIL || 'sujal.jadhav@example.com',
            specialty: 'General Physician',
            role: 'Chief Medical Officer',
            location: 'Mumbai, Maharashtra',
            credentials: {
                registrationId: 'MH-MED-12345',
                qualifications: ['MBBS', 'MD'],
                experience: 15
            }
        });

        console.log('\n🎉 Doctor account created successfully!');
        console.log('==========================================');
        console.log('Username:', doctor.username);
        console.log('Email:', doctor.email);
        console.log('Password:', process.env.INIT_PASSWORD ? '(from .env)' : 'admin123');
        console.log('==========================================');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        console.log('\n✅ Database initialization complete');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

initializeDatabase();
