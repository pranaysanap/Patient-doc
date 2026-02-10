# API Testing Examples

Use these commands to test your backend API. Replace `YOUR_TOKEN` with the JWT token you receive from login.

## Authentication

### Doctor Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/doctor/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"dr.sujal\",\"password\":\"your_password\"}"
```

### Patient Login (Google OAuth)
```bash
curl -X POST http://localhost:5000/api/v1/auth/patient/google ^
  -H "Content-Type: application/json" ^
  -d "{\"token\":\"GOOGLE_ID_TOKEN\"}"
```

### Get Current User
```bash
curl http://localhost:5000/api/v1/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Patients

### Get All Patients (Doctor)
```bash
curl http://localhost:5000/api/v1/patients ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

### Get Patient by ID
```bash
curl http://localhost:5000/api/v1/patients/pat_123456 ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Patient Info
```bash
curl -X PUT http://localhost:5000/api/v1/patients/pat_123456 ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"personalInfo\":{\"phone\":\"+91-9876543210\"}}"
```

## Health Metrics

### Upload Health Metrics
```bash
curl -X POST http://localhost:5000/api/v1/health-metrics/pat_123456 ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"vitals\":{\"heartRate\":{\"current\":72}},\"activity\":{\"steps\":5000}}"
```

### Get Latest Metrics
```bash
curl http://localhost:5000/api/v1/health-metrics/pat_123456/latest ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Metrics History
```bash
curl "http://localhost:5000/api/v1/health-metrics/pat_123456/history?limit=7" ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Prescriptions

### Create Prescription (Doctor)
```bash
curl -X POST http://localhost:5000/api/v1/prescriptions ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"patientId\":\"pat_123456\",\"diagnosis\":\"Hypertension\",\"medicines\":[{\"name\":\"Amlodipine 5mg\",\"dosage\":\"1 Tab\",\"schedule\":{\"morning\":true,\"afternoon\":false,\"night\":false},\"food\":\"After\"}],\"instructions\":\"Monitor blood pressure daily\"}"
```

### Get Patient Prescriptions
```bash
curl http://localhost:5000/api/v1/prescriptions/patient/pat_123456 ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Appointments

### Create Appointment
```bash
curl -X POST http://localhost:5000/api/v1/appointments ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"patientId\":\"pat_123456\",\"appointmentDate\":\"2026-02-15T10:00:00Z\",\"type\":\"Online\",\"purpose\":\"Regular checkup\"}"
```

### Get Doctor Appointments
```bash
curl "http://localhost:5000/api/v1/appointments/doctor?status=pending" ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

### Update Appointment Status
```bash
curl -X PATCH http://localhost:5000/api/v1/appointments/apt_123456/status ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"confirmed\"}"
```

### Add Consultation Report (Doctor)
```bash
curl -X PUT http://localhost:5000/api/v1/appointments/apt_123456/report ^
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"findings\":\"Patient shows improvement\",\"recommendations\":\"Continue current medication\",\"followUpRequired\":true}"
```

---

## Testing Workflow

1. **Start server**: `npm run dev`
2. **Login as doctor**: Use doctor login endpoint
3. **Copy the JWT token** from response
4. **Use token** in Authorization header for other requests
5. **Test each endpoint** with sample data

## Using Postman (Recommended)

1. Import these requests into Postman
2. Create environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `doctorToken`: (set after login)
   - `patientToken`: (set after login)
3. Use `{{baseUrl}}` and `{{doctorToken}}` in requests
