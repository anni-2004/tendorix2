// MongoDB initialization script
db = db.getSiblingDB('tender_system');

// Create collections
db.createCollection('users');
db.createCollection('companies');
db.createCollection('filtered_tenders');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.companies.createIndex({ "user_id": 1 }, { unique: true });
db.companies.createIndex({ "companyDetails.companyName": "text" });
db.companies.createIndex({ "businessCapabilities.industrySectors": "text" });
db.filtered_tenders.createIndex({ "form_url": 1 }, { unique: true });
db.filtered_tenders.createIndex({ "business_category": 1 });
db.filtered_tenders.createIndex({ "location": "text" });
db.filtered_tenders.createIndex({ "title": "text", "scope_of_work": "text" });
db.filtered_tenders.createIndex({ "deadline": 1 });
db.filtered_tenders.createIndex({ "estimated_budget": 1 });

print('Database initialized successfully');