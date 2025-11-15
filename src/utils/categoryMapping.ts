// Category mapping for complaint submission based on box category

export const getComplaintCategories = (boxCategory: string): string[] => {
  const categoryMap: Record<string, string[]> = {
    // Education categories
    "School": ["Teacher Issue", "Facility Problem", "Academic Issue", "Bullying", "Harassment", "Misconduct", "Other"],
    "College": ["Teacher Issue", "Facility Problem", "Academic Issue", "Bullying", "Harassment", "Misconduct", "Other"],
    "University": ["Faculty Issue", "Administration Problem", "Academic Issue", "Research Issue", "Facility Problem", "Other"],
    "Examination Cell": ["Exam Schedule", "Result Issue", "Paper Issue", "Unfair Practice", "Grade Dispute", "Other"],
    "Admission Office": ["Admission Process", "Document Issue", "Fee Related", "Communication Gap", "Delay", "Other"],
    "Library": ["Book Availability", "Staff Behaviour", "Facility Issue", "Fine Related", "Access Issue", "Other"],
    "Laboratory": ["Equipment Issue", "Safety Concern", "Staff Behaviour", "Access Problem", "Maintenance", "Other"],
    "Sports Department": ["Equipment Issue", "Facility Problem", "Coach Behaviour", "Event Management", "Access Issue", "Other"],
    "Accounts / Fees Department": ["Fee Issue", "Receipt Problem", "Refund Delay", "Staff Behaviour", "Wrong Calculation", "Other"],
    "Hostel Office": ["Room Allotment", "Fee Issue", "Staff Behaviour", "Facility Problem", "Safety Concern", "Other"],

    // Corporate / Office categories
    "HR": ["Salary Issue", "Leave Problem", "Attendance Issue", "Workplace Harassment", "Discrimination", "Policy Violation", "Other"],
    "Manager": ["Work Pressure", "Misbehaviour", "Bias", "Communication Gap", "Unrealistic Deadlines", "Micromanagement", "Other"],
    "IT Department": ["System Issue", "Network Problem", "Access Issue", "Response Delay", "Staff Behaviour", "Security Concern", "Other"],
    "Finance": ["Salary Delay", "Reimbursement Issue", "Wrong Calculation", "Policy Violation", "Staff Behaviour", "Other"],
    "Administration": ["Facility Issue", "Policy Problem", "Communication Gap", "Delay", "Staff Behaviour", "Other"],
    "Operations": ["Process Issue", "Resource Problem", "Coordination Gap", "Delay", "Quality Issue", "Other"],
    "Customer Support": ["Response Delay", "Poor Service", "Rude Behaviour", "Issue Not Resolved", "Communication Gap", "Other"],
    "Vendor Management": ["Vendor Behaviour", "Quality Issue", "Delivery Delay", "Contract Violation", "Payment Issue", "Other"],
    "Sales Team": ["Mis-selling", "False Promise", "Communication Gap", "Follow-up Issue", "Behaviour Problem", "Other"],

    // Hostel / PG categories
    "Warden": ["Behaviour Issue", "Bias", "Policy Violation", "Communication Gap", "Abuse of Power", "Other"],
    "Mess": ["Food Quality", "Hygiene Issue", "Menu Problem", "Staff Behaviour", "Timing Issue", "Other"],
    "Security": ["Behaviour Issue", "Negligence", "Harassment", "Access Problem", "Safety Concern", "Other"],
    "Maintenance": ["Repair Delay", "Poor Work Quality", "Staff Behaviour", "Negligence", "Access Issue", "Other"],
    "Electricity / Water": ["Power Cut", "Water Shortage", "Billing Issue", "Leakage", "Delay in Repair", "Other"],
    "Cleanliness": ["Poor Cleaning", "Staff Negligence", "Waste Management", "Pest Problem", "Hygiene Issue", "Other"],
    "Room Issues": ["Furniture Problem", "Facility Issue", "Maintenance Delay", "Cleanliness", "Safety Concern", "Other"],

    // Healthcare / Medical categories
    "Hospital": ["Treatment Issue", "Staff Behaviour", "Facility Problem", "Billing Issue", "Negligence", "Emergency Delay", "Other"],
    "Clinic": ["Doctor Behaviour", "Treatment Issue", "Appointment Delay", "Staff Behaviour", "Billing Problem", "Other"],
    "Pharmacy": ["Medicine Unavailable", "Wrong Medicine", "Overcharging", "Staff Behaviour", "Quality Issue", "Other"],
    "Billing Department": ["Wrong Billing", "Insurance Issue", "Overcharging", "Receipt Problem", "Staff Behaviour", "Other"],
    "Nursing Staff": ["Behaviour Issue", "Negligence", "Poor Service", "Communication Gap", "Delay in Care", "Other"],
    "Doctor Behaviour": ["Rudeness", "Negligence", "Misdiagnosis", "Communication Gap", "Unavailability", "Other"],
    "Emergency Services": ["Response Delay", "Poor Treatment", "Staff Behaviour", "Facility Issue", "Negligence", "Other"],
    "Medical Negligence": ["Wrong Treatment", "Surgery Issue", "Medication Error", "Diagnosis Delay", "Staff Negligence", "Other"],

    // Public Service / Government categories
    "Municipal Corporation": ["Service Issue", "Corruption", "Staff Behaviour", "Delay", "Facility Problem", "Other"],
    "Water Supply Board": ["Water Shortage", "Quality Issue", "Billing Problem", "Leakage", "Staff Behaviour", "Other"],
    "Electricity Department": ["Power Cut", "Billing Issue", "Connection Problem", "Staff Behaviour", "Response Delay", "Other"],
    "Road & Transport Department": ["Road Condition", "Public Transport", "Staff Behaviour", "Service Delay", "Safety Issue", "Other"],
    "Police Department": ["Misbehaviour", "Negligence", "Corruption", "Response Delay", "Harassment", "Other"],
    "Public Grievance Cell": ["Unresolved Issue", "Delay", "Staff Behaviour", "Communication Gap", "Bias", "Other"],
    "Ration / Public Distribution": ["Quality Issue", "Quantity Issue", "Corruption", "Staff Behaviour", "Access Problem", "Other"],
    "Government Office (UID / Passport / Licensing)": ["Document Issue", "Delay", "Corruption", "Staff Behaviour", "Process Problem", "Other"],

    // Customer Service / Retail categories
    "Product Quality": ["Defective Product", "Wrong Product", "Damaged Item", "Quality Issue", "Missing Parts", "Other"],
    "Billing / Pricing": ["Wrong Bill", "Overcharging", "Hidden Charges", "Discount Issue", "Tax Problem", "Other"],
    "Delivery Issue": ["Delay", "Wrong Address", "Damaged Package", "Missing Item", "Poor Handling", "Other"],
    "Refund / Return": ["Refund Delay", "Return Rejected", "Partial Refund", "Process Issue", "Staff Behaviour", "Other"],
    "Warranty Claim": ["Claim Rejected", "Delay", "Poor Service", "Policy Issue", "Communication Gap", "Other"],
    "Service Centre": ["Poor Service", "Delay", "Wrong Repair", "Staff Behaviour", "Overcharging", "Other"],
    "Store Staff Behaviour": ["Rudeness", "Discrimination", "Negligence", "Harassment", "Unhelpful", "Other"],

    // Housing Society / Apartments categories
    "Society Management": ["Poor Management", "Bias", "Communication Gap", "Delay", "Fund Misuse", "Other"],
    "Security Guards": ["Negligence", "Misbehaviour", "Harassment", "Sleeping on Duty", "Access Issue", "Other"],
    "Cleaning / Housekeeping": ["Poor Cleaning", "Negligence", "Staff Behaviour", "Timing Issue", "Incomplete Work", "Other"],
    "Parking Issues": ["Parking Shortage", "Unauthorized Parking", "Rule Violation", "Damage to Vehicle", "Access Issue", "Other"],
    "Maintenance Team": ["Delay", "Poor Work", "Staff Behaviour", "Overcharging", "Incomplete Work", "Other"],
    "Lift / Facility Issues": ["Lift Breakdown", "Maintenance Delay", "Safety Issue", "Power Issue", "Other"],
    "Neighbour Disturbance": ["Noise", "Harassment", "Property Damage", "Parking Dispute", "Behaviour Issue", "Other"],

    // Transport / Travel categories
    "Bus Service": ["Delay", "Rash Driving", "Overcrowding", "Staff Behaviour", "Route Issue", "Other"],
    "Train Service": ["Delay", "Cleanliness", "Overcrowding", "Staff Behaviour", "Safety Issue", "Other"],
    "Taxi / Cab": ["Overcharging", "Rude Behaviour", "Rash Driving", "Route Issue", "Cleanliness", "Other"],
    "Auto / Rickshaw": ["Overcharging", "Refusal to Go", "Rude Behaviour", "Rash Driving", "Meter Tampering", "Other"],
    "Driver Behaviour": ["Rudeness", "Harassment", "Dangerous Driving", "Unprofessional", "Other"],
    "Overcharging": ["Fare Issue", "Hidden Charges", "Meter Tampering", "No Receipt", "Other"],
    "Delay / Cancellation": ["Service Delay", "Last Minute Cancellation", "No Information", "Refund Issue", "Other"],

    // Technology / IT Support categories
    "Software Issue": ["Bug", "Crash", "Feature Not Working", "Performance Issue", "Data Loss", "Other"],
    "Hardware Issue": ["Device Problem", "Connection Issue", "Physical Damage", "Malfunction", "Other"],
    "Network / Wi-Fi Issue": ["No Connection", "Slow Speed", "Frequent Disconnection", "Access Problem", "Other"],
    "Online Portal Problem": ["Login Issue", "Page Error", "Slow Loading", "Feature Not Working", "Data Issue", "Other"],
    "Account / Login Issue": ["Can't Login", "Password Reset", "Account Locked", "Access Problem", "Other"],
    "Data Loss": ["File Deleted", "Database Issue", "Backup Problem", "Recovery Issue", "Other"],
    "Security Concern": ["Data Breach", "Unauthorized Access", "Malware", "Privacy Issue", "Other"],

    // Food & Dining categories
    "Canteen": ["Food Quality", "Hygiene", "Staff Behaviour", "Overcharging", "Limited Options", "Other"],
    "Cafeteria": ["Food Quality", "Hygiene", "Staff Behaviour", "Timing Issue", "Crowding", "Other"],
    "Restaurant": ["Food Quality", "Service Issue", "Staff Behaviour", "Billing Problem", "Hygiene", "Other"],
    "Food Quality": ["Taste Issue", "Stale Food", "Undercooked", "Wrong Order", "Health Issue", "Other"],
    "Staff Behaviour": ["Rudeness", "Discrimination", "Negligence", "Unhelpful", "Harassment", "Other"],
    "Hygiene Issues": ["Dirty Utensils", "Poor Kitchen Hygiene", "Pest Problem", "Unsafe Food", "Other"],

    // Events & Activities categories
    "Event Management": ["Poor Organization", "Communication Gap", "Delay", "Facility Issue", "Other"],
    "Cultural Activities": ["Bias in Selection", "Poor Arrangement", "Limited Participation", "Communication Issue", "Other"],
    "Sports Events": ["Poor Organization", "Unfair Selection", "Equipment Issue", "Delay", "Other"],
    "Registration Problems": ["System Issue", "Communication Gap", "Delay", "Fees Problem", "Other"],
    "Miscommunication": ["Wrong Information", "Late Notification", "Conflicting Info", "No Information", "Other"],

    // General categories
    "Complaint About Staff": ["Rude Behaviour", "Negligence", "Discrimination", "Harassment", "Abuse of Power", "Other"],
    "Service Delay": ["Excessive Wait Time", "No Response", "Slow Processing", "Missed Deadline", "Other"],
    "Behavioural Misconduct": ["Rudeness", "Harassment", "Discrimination", "Bullying", "Verbal Abuse", "Other"],
    "Mismanagement": ["Poor Planning", "Resource Waste", "Communication Gap", "Coordination Issue", "Other"],
    "Safety Concern": ["Fire Hazard", "Structural Issue", "Security Gap", "Health Risk", "Emergency Access", "Other"],
    "Facility Issue": ["Broken Equipment", "Poor Maintenance", "Cleanliness", "Accessibility", "Other"],
  };

  return categoryMap[boxCategory] || ["Please describe your complaint"];
};
