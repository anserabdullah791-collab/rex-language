# ============================================
# Rex Business Profile Example v6.1
# Shows how to create business profiles in Rex
# ============================================

import business

# Step 1: Create a business profile — just pass the name
profile = business.create("Digital Creators")

# Step 2: Set profile information (builder pattern)
business.setTagline(profile, "World's Most Premium Digital Creative Agency")
business.setDescription(profile, "We create exceptional digital experiences that help businesses grow and brands stand out.")
business.setCategory(profile, "Digital Creative Agency")
business.setAddress(profile, "Pakistan")
business.setPhone(profile, "+92 300 0000000")
business.setEmail(profile, "contact@digitalcreators.com")
business.setWebsite(profile, "https://digitalcreators.com")
business.setHours(profile, "Mon-Sat: 9AM - 7PM")

# Step 3: Add services
business.addService(profile, "Web Development")
business.addService(profile, "Software Development")
business.addService(profile, "Mobile Apps")
business.addService(profile, "Brand Design")
business.addService(profile, "Video Production")
business.addService(profile, "Digital Advertising")

# Step 4: Add team members
business.addMember(profile, "Abdullah Anser", "Director & Owner")
business.addMember(profile, "Box", "CEO")
business.addMember(profile, "Robert", "Executive Assistant")

# Step 5: Add social links
business.addSocial(profile, "facebook", "https://facebook.com/digitalcreators")
business.addSocial(profile, "instagram", "https://instagram.com/digitalcreators")
business.addSocial(profile, "linkedin", "https://linkedin.com/company/digitalcreators")

# Step 6: Save in multiple formats
p "Saving business profile..."
business.save(profile, "digital-creators.json")
p "  JSON saved: digital-creators.json"

business.saveHtml(profile, "digital-creators.html")
p "  HTML saved: digital-creators.html"

business.saveWeb(profile, "digital-creators.rexweb")
p "  RexWeb saved: digital-creators.rexweb"

p ""
p "Business Profile created successfully!"
p "3 files generated — open digital-creators.html in browser to view"
