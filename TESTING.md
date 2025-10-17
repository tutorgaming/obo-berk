# 🧪 Testing Checklist for OBO-Berk

Use this checklist to verify all features are working correctly.

## ✅ Pre-Testing Setup

- [ ] Docker is installed and running
- [ ] Ports 80, 5000, and 27017 are available
- [ ] Run `docker-compose up -d` successfully
- [ ] Frontend accessible at http://localhost
- [ ] Backend API accessible at http://localhost:5000/api/health

## 👤 User Management Tests

### Create User
- [ ] Click "Create New User" button
- [ ] Form appears with name, email, and department fields
- [ ] Fill in name: "John Doe"
- [ ] Fill in email: "john@obodroid.com"
- [ ] Fill in department: "Engineering"
- [ ] Click "Create User"
- [ ] User appears in selection dropdown
- [ ] User is automatically selected
- [ ] User details shown in blue box

### Select User
- [ ] Create second user "Jane Smith"
- [ ] Select "John Doe" from dropdown
- [ ] User details update correctly
- [ ] Select "Jane Smith" from dropdown
- [ ] User details update correctly

### Error Handling
- [ ] Try creating user with duplicate email
- [ ] Verify error message appears
- [ ] Try creating user without email
- [ ] Form validation works

## 📁 Project Management Tests

### Create Project
- [ ] Select a user
- [ ] Click "New Project" button
- [ ] Form appears
- [ ] Fill in project name: "Website Redesign"
- [ ] Fill in description: "Complete website overhaul"
- [ ] Fill in budget: "50000"
- [ ] Click "Create Project"
- [ ] Project appears in the grid
- [ ] Project shows "active" status
- [ ] Budget displays as "฿50,000"

### View Project
- [ ] Click on the project card
- [ ] Project detail page loads
- [ ] Project name displayed correctly
- [ ] Description shown
- [ ] Owner name shown
- [ ] Budget shown
- [ ] Status badge shown

### Multiple Projects
- [ ] Create 3 different projects
- [ ] All projects appear in grid
- [ ] Click on different projects
- [ ] Each loads correctly

## 💰 Expense Tracking Tests

### Add Expense - Eating
- [ ] In project detail, click "Add Expense"
- [ ] Form appears
- [ ] Fill name: "Team Lunch at Restaurant"
- [ ] Select type: "Eating"
- [ ] Enter amount: "1500"
- [ ] Select today's date
- [ ] Add notes: "Monthly team building lunch"
- [ ] Upload a receipt image (JPG/PNG)
- [ ] Click "Add Expense"
- [ ] Expense appears in table
- [ ] Total updates to ฿1,500.00

### Add Expense - Traveling
- [ ] Click "Add Expense" again
- [ ] Fill name: "Taxi to Client Meeting"
- [ ] Select type: "Traveling"
- [ ] Enter amount: "350"
- [ ] Select date
- [ ] Upload receipt
- [ ] Click "Add Expense"
- [ ] Total updates to ฿1,850.00

### Add Multiple Expenses
- [ ] Add "Hotel Stay" - accommodation - ฿3000
- [ ] Add "Office Supplies" - equipment - ฿750
- [ ] Add "Coffee with Client" - other - ฿200
- [ ] Total should be ฿6,150.00
- [ ] All expenses appear in table

### View Receipt
- [ ] Click "View" on receipt link
- [ ] Receipt opens in new tab
- [ ] Image/PDF displays correctly
- [ ] Can download the file

### Filter Expenses
- [ ] Select filter: "Eating"
- [ ] Only eating expenses shown
- [ ] Total updates to eating expenses only
- [ ] Select filter: "Traveling"
- [ ] Only traveling expenses shown
- [ ] Select "All Types"
- [ ] All expenses shown again

### Delete Expense
- [ ] Click "Delete" on an expense
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Expense removed from list
- [ ] Total amount updates

### Expense Table Display
- [ ] Date displays in Thai format
- [ ] Type shown with badge
- [ ] Amount formatted correctly (฿X,XXX.XX)
- [ ] Notes appear under expense name
- [ ] Receipt status shows correctly

## 📄 PDF Export Tests

### Export All Expenses
- [ ] Click "Export PDF" button
- [ ] PDF downloads automatically
- [ ] Open PDF file
- [ ] PDF contains:
  - [ ] Title "OBO-Berk (โอโบ-เบิก)"
  - [ ] Project name
  - [ ] Project description
  - [ ] Owner information
  - [ ] Total expenses amount
  - [ ] Expense table with all entries
  - [ ] Expense details section
  - [ ] Receipt images embedded

### Export Filtered Expenses
- [ ] Select filter: "Eating"
- [ ] Click "Export PDF"
- [ ] PDF downloads
- [ ] Open PDF
- [ ] Only eating expenses included
- [ ] Total reflects eating expenses only
- [ ] Receipt images match expenses

### PDF Quality Check
- [ ] Text is readable
- [ ] Tables formatted properly
- [ ] Images are clear and properly sized
- [ ] Thai characters display correctly (โอโบ-เบิก)
- [ ] Currency formatting correct (฿)
- [ ] Page breaks work correctly

## 🔄 Data Persistence Tests

### Browser Refresh
- [ ] Create user, project, and expenses
- [ ] Refresh browser (F5)
- [ ] All data still present
- [ ] Navigate back to project
- [ ] All expenses still there

### Docker Restart
- [ ] Run `docker-compose restart`
- [ ] Wait for services to start
- [ ] Access application
- [ ] All data still present
- [ ] Receipts still accessible

### Docker Stop/Start
- [ ] Run `docker-compose down`
- [ ] Run `docker-compose up -d`
- [ ] Access application
- [ ] All data still present (volumes persisted)

## 🎨 UI/UX Tests

### Responsive Design
- [ ] Resize browser to mobile width (375px)
- [ ] All content readable
- [ ] Buttons accessible
- [ ] Tables scroll horizontally
- [ ] Forms work on mobile
- [ ] Test on tablet width (768px)
- [ ] Test on desktop width (1920px)

### Visual Elements
- [ ] Status badges color-coded
- [ ] Loading states appear
- [ ] Error messages styled
- [ ] Forms have proper spacing
- [ ] Buttons have hover effects
- [ ] Links are clickable and styled

### Navigation
- [ ] "Back to Projects" button works
- [ ] Click project card navigates correctly
- [ ] Browser back button works
- [ ] Routes display correct content

## 🐛 Error Handling Tests

### Network Errors
- [ ] Stop backend: `docker-compose stop backend`
- [ ] Try creating user
- [ ] Error message appears
- [ ] Start backend: `docker-compose start backend`
- [ ] Functionality restored

### File Upload Errors
- [ ] Try uploading file > 10MB
- [ ] Error message appears
- [ ] Try uploading .txt file
- [ ] Only allowed formats work

### Form Validation
- [ ] Submit user form without email
- [ ] Validation error
- [ ] Submit expense without amount
- [ ] Validation error
- [ ] Submit with negative amount
- [ ] Validation works

## 🚀 Performance Tests

### Load Time
- [ ] First page load < 3 seconds
- [ ] Navigation between pages smooth
- [ ] Image loading optimized

### Large Dataset
- [ ] Create 20+ expenses
- [ ] Table still responsive
- [ ] PDF generation works
- [ ] Filtering still fast

## 🔐 File Upload Tests

### Valid Files
- [ ] Upload .jpg image - works
- [ ] Upload .png image - works
- [ ] Upload .jpeg image - works
- [ ] Upload .pdf file - works

### Invalid Files
- [ ] Try .txt file - rejected
- [ ] Try .doc file - rejected
- [ ] Try file > 10MB - rejected

## 📱 Cross-Browser Tests

- [ ] Chrome - all features work
- [ ] Firefox - all features work
- [ ] Safari - all features work (if Mac available)
- [ ] Edge - all features work

## 🐳 Docker Tests

### Production Mode
- [ ] Run `docker-compose up -d`
- [ ] All containers start
- [ ] Check status: `docker-compose ps`
- [ ] All healthy
- [ ] Access at http://localhost

### Development Mode
- [ ] Run `docker-compose -f docker-compose.dev.yml up`
- [ ] Hot reload works on backend
- [ ] Hot reload works on frontend
- [ ] Access at http://localhost:5173

### Helper Scripts
- [ ] Run `./start.sh` (Linux/Mac)
- [ ] Interactive menu works
- [ ] Start production works
- [ ] View logs works
- [ ] Stop services works

## 📊 API Tests

### Health Check
- [ ] Visit http://localhost:5000/api/health
- [ ] Returns { "status": "OK" }

### Users Endpoint
- [ ] GET http://localhost:5000/api/users
- [ ] Returns array of users

### Projects Endpoint
- [ ] GET http://localhost:5000/api/projects
- [ ] Returns array of projects

### Expenses Endpoint
- [ ] GET http://localhost:5000/api/expenses/project/{projectId}
- [ ] Returns expenses for project

## 📝 Documentation Tests

- [ ] README.md opens and is readable
- [ ] QUICKSTART.md provides clear instructions
- [ ] DOCKER.md explains Docker usage
- [ ] DEPLOYMENT.md covers deployment
- [ ] All code examples work

## ✨ Final Verification

- [ ] All features from requirements implemented
- [ ] User can register/select user ✅
- [ ] User can create projects ✅
- [ ] User can add expenses ✅
- [ ] Expenses have name, date, type, amount ✅
- [ ] File upload works ✅
- [ ] PDF export works ✅
- [ ] PDF shows table + images ✅
- [ ] No authentication (POC) ✅
- [ ] Docker deployment ready ✅

## 🎉 Success Criteria

All checkboxes above should be checked ✅

If any issues found:
1. Check `docker-compose logs -f`
2. Verify environment variables
3. Check browser console for errors
4. Review DOCKER.md troubleshooting section

---

**Testing completed on:** _________________

**Tested by:** _________________

**Result:** ⭕ Pass / ❌ Fail

**Notes:**
