# Backend Requirements & Implementation Guide

## 🏗️ Backend Architecture Overview

The Nutri-Vision AI backend requires a robust, HIPAA-compliant architecture capable of handling sensitive medical data while providing real-time nutrition analysis and health insights.

## 🔐 Core Backend Services

### 1. Authentication & Authorization Service

**Purpose**: Secure user authentication with medical-grade security
**Technology**: Node.js/Express with JWT + OAuth2
**Database**: PostgreSQL with encrypted user credentials

**Key Functions**:
\`\`\`javascript
// User registration with health data consent
POST /api/auth/register
{
  email: string,
  password: string, // bcrypt hashed
  healthDataConsent: boolean,
  privacyConsent: boolean,
  mfaEnabled: boolean
}

// Secure login with MFA
POST /api/auth/login
{
  email: string,
  password: string,
  mfaToken?: string
}

// Health data access token (short-lived)
POST /api/auth/health-token
Headers: { Authorization: "Bearer <jwt>" }
\`\`\`

**Implementation Details**:
- **Password Security**: bcrypt with salt rounds 12+
- **JWT Tokens**: Short-lived (15 min) with refresh tokens
- **MFA Support**: TOTP/SMS for sensitive health data access
- **Session Management**: Redis-based session store with encryption
- **Rate Limiting**: Prevent brute force attacks (5 attempts/15 min)

### 2. Health Profile Management Service

**Purpose**: Store and manage comprehensive health profiles
**Technology**: Node.js with Prisma ORM
**Database**: PostgreSQL with field-level encryption

**Key Functions**:
\`\`\`javascript
// Create/Update health profile
PUT /api/health/profile
{
  demographics: {
    age: number,
    gender: string,
    activityLevel: string,
    height: number,
    weight: number
  },
  medicalConditions: [
    {
      condition: string,
      severity: "mild" | "moderate" | "severe",
      diagnosedDate: Date,
      medications: string[],
      restrictions: string[]
    }
  ],
  allergies: [
    {
      allergen: string,
      severity: "mild" | "moderate" | "severe",
      reaction: string,
      emergencyProtocol: string
    }
  ],
  emergencyContact: {
    name: string,
    relationship: string,
    phone: string,
    medicalPowerOfAttorney: boolean
  }
}

// Get health profile with privacy controls
GET /api/health/profile?include=demographics,conditions,allergies
\`\`\`

**Implementation Details**:
- **Field Encryption**: AES-256 encryption for all PII/PHI
- **Access Logging**: Audit trail for all health data access
- **Data Validation**: Medical condition validation against ICD-10 codes
- **Privacy Controls**: Granular permissions for data sharing
- **Backup Strategy**: Encrypted backups with 7-year retention

### 3. Food Recognition & Analysis Service

**Purpose**: Multi-modal food identification and nutritional analysis
**Technology**: Python/FastAPI with ML models
**Database**: MongoDB for food database, Redis for caching

**Key Functions**:
\`\`\`python
# Text-based food logging
POST /api/food/analyze-text
{
  "description": "grilled chicken breast with steamed broccoli",
  "portion_size": "1 cup",
  "meal_type": "lunch",
  "user_id": "encrypted_user_id"
}

# Image-based food recognition
POST /api/food/analyze-image
Content-Type: multipart/form-data
{
  "image": File,
  "user_id": "encrypted_user_id",
  "meal_context": "dinner"
}

# Voice-to-text food logging
POST /api/food/analyze-voice
{
  "audio_data": "base64_encoded_audio",
  "user_id": "encrypted_user_id",
  "language": "en-US"
}
\`\`\`

**Implementation Details**:
- **ML Models**: 
  - YOLOv8 for food object detection
  - ResNet50 for food classification
  - Portion estimation using depth analysis
- **Nutrition Database**: USDA FoodData Central integration
- **Voice Processing**: Google Speech-to-Text API with medical vocabulary
- **Caching Strategy**: Redis for frequently accessed nutrition data
- **Accuracy Validation**: 95%+ accuracy for common foods

### 4. Medical Interaction & Safety Service

**Purpose**: Real-time medication interaction and allergen checking
**Technology**: Node.js with medical databases
**Database**: PostgreSQL with medical interaction rules

**Key Functions**:
\`\`\`javascript
// Check food-drug interactions
POST /api/medical/interaction-check
{
  foodItems: [
    {
      name: "grapefruit",
      quantity: "1 medium",
      nutrients: { vitamin_c: 65, potassium: 237 }
    }
  ],
  medications: [
    {
      name: "atorvastatin",
      dosage: "20mg",
      timing: "evening"
    }
  ],
  userId: "encrypted_user_id"
}

// Allergen detection in food
POST /api/medical/allergen-check
{
  foodItems: ["salmon", "almonds", "wheat flour"],
  userAllergies: [
    {
      allergen: "tree nuts",
      severity: "severe",
      crossReactivity: ["almonds", "walnuts", "pecans"]
    }
  ]
}

// Emergency medical information
GET /api/medical/emergency-info/:userId
Headers: { "Emergency-Access-Token": "emergency_token" }
\`\`\`

**Implementation Details**:
- **Drug Database**: FDA Orange Book + custom interaction rules
- **Allergen Database**: Comprehensive allergen cross-reactivity matrix
- **Real-time Alerts**: WebSocket connections for immediate warnings
- **Emergency Access**: Special tokens for first responders
- **Medical Validation**: Licensed pharmacist review of interaction rules

### 5. AI Insights & Recommendation Engine

**Purpose**: Personalized health insights and meal recommendations
**Technology**: Python/TensorFlow with custom ML models
**Database**: ClickHouse for analytics, PostgreSQL for user data

**Key Functions**:
\`\`\`python
# Generate personalized meal recommendations
POST /api/ai/meal-recommendations
{
  "user_health_profile": {
    "conditions": ["type2_diabetes", "hypertension"],
    "goals": ["weight_loss", "blood_sugar_control"],
    "preferences": ["mediterranean", "low_sodium"],
    "restrictions": ["gluten_free"]
  },
  "current_nutrition": {
    "daily_calories": 1450,
    "daily_sodium": 1800,
    "daily_carbs": 180
  },
  "meal_type": "dinner",
  "time_of_day": "18:00"
}

# Analyze nutrition patterns and health trends
POST /api/ai/health-analysis
{
  "user_id": "encrypted_user_id",
  "time_period": "30_days",
  "analysis_type": ["blood_sugar_correlation", "symptom_patterns", "nutrient_deficiency_risk"]
}

# Predictive health risk assessment
POST /api/ai/risk-assessment
{
  "user_id": "encrypted_user_id",
  "risk_factors": ["family_history", "current_nutrition", "lifestyle"],
  "prediction_horizon": "6_months"
}
\`\`\`

**Implementation Details**:
- **ML Models**:
  - Collaborative filtering for meal recommendations
  - Time series analysis for health trend prediction
  - Classification models for symptom correlation
- **Training Data**: Anonymized nutrition and health outcome data
- **Model Updates**: Weekly retraining with new user data
- **Explainable AI**: Provide reasoning for all recommendations
- **A/B Testing**: Continuous model performance optimization

### 6. Healthcare Integration Service

**Purpose**: Integration with healthcare providers and EHR systems
**Technology**: Node.js with FHIR R4 compliance
**Database**: PostgreSQL with HL7 message queuing

**Key Functions**:
\`\`\`javascript
// Share nutrition data with healthcare provider
POST /api/healthcare/share-data
{
  providerId: "npi_1234567890",
  patientId: "encrypted_patient_id",
  dataTypes: ["nutrition_summary", "medication_adherence", "health_goals"],
  timeRange: {
    start: "2024-01-01",
    end: "2024-03-31"
  },
  consentToken: "patient_consent_token"
}

// Receive lab results from healthcare provider
POST /api/healthcare/lab-results
{
  patientId: "encrypted_patient_id",
  providerId: "npi_1234567890",
  labResults: [
    {
      test: "HbA1c",
      value: 6.8,
      unit: "%",
      referenceRange: "4.0-5.6",
      date: "2024-01-15"
    }
  ],
  fhirBundle: "base64_encoded_fhir_bundle"
}

// Generate clinical nutrition report
GET /api/healthcare/clinical-report/:patientId
Query: {
  format: "pdf" | "fhir" | "hl7",
  period: "30_days",
  include: "recommendations,trends,alerts"
}
\`\`\`

**Implementation Details**:
- **FHIR Compliance**: Full FHIR R4 implementation for interoperability
- **HL7 Integration**: Support for HL7 v2.x and v3 messaging
- **Provider Authentication**: OAuth2 with healthcare provider credentials
- **Data Mapping**: Automatic conversion between nutrition data and clinical formats
- **Audit Compliance**: Complete audit trail for all healthcare data sharing

### 7. Real-time Notification Service

**Purpose**: Critical health alerts and medication reminders
**Technology**: Node.js with WebSocket and push notification services
**Database**: Redis for real-time data, PostgreSQL for notification history

**Key Functions**:
\`\`\`javascript
// Send critical health alert
POST /api/notifications/critical-alert
{
  userId: "encrypted_user_id",
  alertType: "allergen_detected" | "drug_interaction" | "emergency",
  severity: "low" | "medium" | "high" | "critical",
  message: "Severe allergen detected in logged food",
  actionRequired: true,
  emergencyContacts: ["contact_id_1", "contact_id_2"]
}

// Schedule medication reminder
POST /api/notifications/medication-reminder
{
  userId: "encrypted_user_id",
  medicationName: "Metformin",
  dosage: "500mg",
  scheduledTime: "2024-01-15T08:00:00Z",
  mealTiming: "with_breakfast",
  reminderTypes: ["push", "sms", "email"]
}

// WebSocket connection for real-time alerts
WS /api/notifications/realtime/:userId
\`\`\`

**Implementation Details**:
- **Push Notifications**: Firebase Cloud Messaging for mobile apps
- **SMS Alerts**: Twilio integration for critical health alerts
- **Email Notifications**: SendGrid with medical-grade templates
- **WebSocket Management**: Socket.io with authentication and encryption
- **Delivery Confirmation**: Track and retry failed critical notifications

### 8. Data Analytics & Reporting Service

**Purpose**: Generate health insights and compliance reports
**Technology**: Python/Pandas with Apache Spark for big data
**Database**: ClickHouse for analytics, PostgreSQL for metadata

**Key Functions**:
\`\`\`python
# Generate user health dashboard data
GET /api/analytics/dashboard/:userId
Query: {
  period: "7_days" | "30_days" | "90_days",
  metrics: ["nutrition_trends", "health_goals", "medication_adherence"],
  format: "json" | "csv"
}

# Population health analytics (anonymized)
POST /api/analytics/population-health
{
  "cohort_criteria": {
    "age_range": [25, 65],
    "conditions": ["diabetes", "hypertension"],
    "time_period": "2023-01-01_to_2023-12-31"
  },
  "analysis_type": "nutrition_outcomes",
  "privacy_level": "k_anonymity_5"
}

# Compliance and audit reports
GET /api/analytics/compliance-report
Query: {
  report_type: "hipaa_audit" | "data_access" | "security_events",
  date_range: "2024-01-01_to_2024-01-31",
  format: "pdf" | "json"
}
\`\`\`

**Implementation Details**:
- **Data Pipeline**: Apache Kafka for real-time data streaming
- **Analytics Engine**: Apache Spark for large-scale data processing
- **Privacy Protection**: Differential privacy for population analytics
- **Report Generation**: Automated PDF generation with medical formatting
- **Performance Optimization**: Materialized views for common queries

## 🗄️ Database Architecture

### Primary Database (PostgreSQL)
\`\`\`sql
-- Users table with encryption
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  encrypted_pii TEXT, -- AES-256 encrypted personal data
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  health_data_consent BOOLEAN DEFAULT FALSE,
  privacy_settings JSONB
);

-- Health profiles with field-level encryption
CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  encrypted_demographics TEXT, -- Age, gender, etc.
  encrypted_medical_conditions TEXT, -- Medical conditions array
  encrypted_allergies TEXT, -- Allergy information
  encrypted_medications TEXT, -- Current medications
  encrypted_emergency_contact TEXT, -- Emergency contact info
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Food logs with nutrition data
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_items JSONB NOT NULL, -- Array of food items with nutrition
  meal_type VARCHAR(50), -- breakfast, lunch, dinner, snack
  logged_at TIMESTAMP DEFAULT NOW(),
  source_type VARCHAR(20), -- text, image, voice, barcode
  confidence_score DECIMAL(3,2), -- AI confidence in recognition
  verified BOOLEAN DEFAULT FALSE -- User verification of accuracy
);

-- Medical interactions and alerts
CREATE TABLE medical_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- drug_interaction, allergen, etc.
  severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
  message TEXT NOT NULL,
  triggered_by JSONB, -- What triggered the alert
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Analytics Database (ClickHouse)
\`\`\`sql
-- Nutrition analytics table
CREATE TABLE nutrition_analytics (
  user_id String,
  date Date,
  meal_type String,
  calories Float64,
  protein Float64,
  carbs Float64,
  fat Float64,
  sodium Float64,
  fiber Float64,
  sugar Float64,
  health_conditions Array(String),
  medication_interactions UInt8,
  allergen_alerts UInt8
) ENGINE = MergeTree()
ORDER BY (user_id, date);

-- Health outcomes tracking
CREATE TABLE health_outcomes (
  user_id String,
  date Date,
  health_score Float64,
  goal_adherence Float64,
  symptom_severity Float64,
  medication_adherence Float64,
  lab_values Map(String, Float64)
) ENGINE = MergeTree()
ORDER BY (user_id, date);
\`\`\`

### Cache Layer (Redis)
\`\`\`javascript
// User session cache
SET user:session:{userId} {
  "healthToken": "encrypted_token",
  "permissions": ["read_profile", "write_food_log"],
  "lastActivity": "2024-01-15T10:30:00Z",
  "mfaVerified": true
} EX 900 // 15 minutes

// Nutrition data cache
SET nutrition:food:{foodId} {
  "name": "Grilled Chicken Breast",
  "calories_per_100g": 165,
  "protein_per_100g": 31,
  "allergens": ["none"],
  "last_updated": "2024-01-15"
} EX 86400 // 24 hours

// Real-time alerts queue
LPUSH alerts:critical:{userId} {
  "type": "allergen_detected",
  "severity": "high",
  "message": "Tree nuts detected in logged meal",
  "timestamp": "2024-01-15T12:00:00Z"
}
\`\`\`

## 🔒 Security Implementation

### Encryption Strategy
\`\`\`javascript
// Field-level encryption for health data
const crypto = require('crypto');

class HealthDataEncryption {
  constructor(encryptionKey) {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(encryptionKey, 'hex');
  }

  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(
      this.algorithm, 
      this.key, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
\`\`\`

### API Security Middleware
\`\`\`javascript
// HIPAA-compliant request logging
const auditLogger = (req, res, next) => {
  const auditLog = {
    userId: req.user?.id,
    action: `${req.method} ${req.path}`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    dataAccessed: req.path.includes('/health/') ? 'PHI' : 'non-PHI'
  };
  
  // Log to secure audit database
  auditDatabase.log(auditLog);
  next();
};

// Rate limiting for health endpoints
const healthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many health data requests',
  standardHeaders: true,
  legacyHeaders: false,
});
\`\`\`

## 🚀 Deployment Architecture

### Microservices Deployment
\`\`\`yaml
# docker-compose.yml for development
version: '3.8'
services:
  auth-service:
    build: ./services/auth
    environment:
      - DATABASE_URL=${AUTH_DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    ports:
      - "3001:3000"
    
  health-service:
    build: ./services/health
    environment:
      - DATABASE_URL=${HEALTH_DATABASE_URL}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    ports:
      - "3002:3000"
    
  food-analysis-service:
    build: ./services/food-analysis
    environment:
      - ML_MODEL_PATH=/models
      - NUTRITION_API_KEY=${NUTRITION_API_KEY}
    ports:
      - "3003:3000"
    volumes:
      - ./models:/models
    
  medical-service:
    build: ./services/medical
    environment:
      - DRUG_DATABASE_URL=${DRUG_DATABASE_URL}
      - FDA_API_KEY=${FDA_API_KEY}
    ports:
      - "3004:3000"
    
  ai-insights-service:
    build: ./services/ai-insights
    environment:
      - TENSORFLOW_MODEL_PATH=/ai-models
      - ANALYTICS_DATABASE_URL=${ANALYTICS_DATABASE_URL}
    ports:
      - "3005:3000"
    volumes:
      - ./ai-models:/ai-models
    
  notification-service:
    build: ./services/notifications
    environment:
      - FIREBASE_KEY=${FIREBASE_KEY}
      - TWILIO_SID=${TWILIO_SID}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    ports:
      - "3006:3000"
    
  api-gateway:
    build: ./gateway
    environment:
      - AUTH_SERVICE_URL=http://auth-service:3000
      - HEALTH_SERVICE_URL=http://health-service:3000
      - FOOD_SERVICE_URL=http://food-analysis-service:3000
      - MEDICAL_SERVICE_URL=http://medical-service:3000
      - AI_SERVICE_URL=http://ai-insights-service:3000
      - NOTIFICATION_SERVICE_URL=http://notification-service:3000
    ports:
      - "8080:8080"
    depends_on:
      - auth-service
      - health-service
      - food-analysis-service
      - medical-service
      - ai-insights-service
      - notification-service
\`\`\`

### Production Infrastructure (AWS)
\`\`\`yaml
# kubernetes/production.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nutri-vision-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nutri-vision-backend
  template:
    metadata:
      labels:
        app: nutri-vision-backend
    spec:
      containers:
      - name: api-gateway
        image: nutri-vision/api-gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: encryption-secret
              key: key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
\`\`\`

## 📊 Monitoring & Observability

### Health Monitoring
\`\`\`javascript
// Health check endpoints
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {
      database: checkDatabaseConnection(),
      redis: checkRedisConnection(),
      externalAPIs: checkExternalAPIs()
    }
  };
  
  res.status(200).json(healthCheck);
});

// Medical-specific monitoring
app.get('/health/medical', async (req, res) => {
  const medicalHealth = {
    drugInteractionAPI: await checkDrugAPI(),
    nutritionDatabase: await checkNutritionDB(),
    allergenDatabase: await checkAllergenDB(),
    emergencyAlerts: await checkAlertSystem(),
    encryptionService: await checkEncryption()
  };
  
  res.status(200).json(medicalHealth);
});
\`\`\`

### Performance Metrics
\`\`\`javascript
// Custom metrics for medical features
const prometheus = require('prom-client');

const criticalAlertLatency = new prometheus.Histogram({
  name: 'critical_alert_latency_seconds',
  help: 'Time to deliver critical health alerts',
  buckets: [0.1, 0.5, 1, 2, 5]
});

const allergenDetectionAccuracy = new prometheus.Gauge({
  name: 'allergen_detection_accuracy',
  help: 'Accuracy rate of allergen detection',
});

const medicationInteractionChecks = new prometheus.Counter({
  name: 'medication_interaction_checks_total',
  help: 'Total number of medication interaction checks performed'
});
\`\`\`

This comprehensive backend architecture ensures medical-grade security, real-time health monitoring, and scalable performance while maintaining HIPAA compliance and user privacy protection.
