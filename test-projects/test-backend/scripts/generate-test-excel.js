#!/usr/bin/env node

/**
 * Script to generate a test Excel file with 1000 user entries
 * for testing bulk upload functionality
 *
 * Usage:
 *   node scripts/generate-test-excel.js [output-path]
 *
 * Example:
 *   node scripts/generate-test-excel.js ./test-users-1000.xlsx
 */

const XLSX = require('xlsx');
const path = require('path');

// Configuration
const NUM_USERS = 1000;
const DEFAULT_OUTPUT_PATH = './test-users-1000.xlsx';

// Generate realistic test data
const generateUsers = (count) => {
  const users = [];

  // First names pool
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
    'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
    'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
    'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
    'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
    'Frank', 'Rachel', 'Alexander', 'Catherine', 'Patrick', 'Carolyn', 'Raymond', 'Janet',
    'Jack', 'Ruth', 'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane'
  ];

  // Last names pool
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
    'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
    'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
    'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell'
  ];

  // Email domains pool
  const domains = [
    'example.com', 'test.com', 'demo.com', 'sample.org', 'testmail.com',
    'demomail.net', 'samplemail.org', 'mailtest.com', 'testuser.org', 'demouser.net'
  ];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];

    // Create unique email by adding index and random number
    const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`;
    const email = `${emailPrefix}@${domain}`;

    // 90% chance to have a name, 10% chance to leave it empty (optional field)
    const name = Math.random() > 0.1 ? `${firstName} ${lastName}` : '';

    users.push({
      email,
      name
    });
  }

  return users;
};

// Main function
const main = () => {
  try {
    console.log(`Generating ${NUM_USERS} test users...`);

    // Generate users
    const users = generateUsers(NUM_USERS);

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(users);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 40 }, // email column
      { wch: 25 }  // name column
    ];

    // Get output path from command line args or use default
    const outputPath = process.argv[2] || DEFAULT_OUTPUT_PATH;
    const absolutePath = path.resolve(outputPath);

    // Write file
    XLSX.writeFile(workbook, absolutePath);

    console.log('✓ Successfully generated test Excel file!');
    console.log(`  - Location: ${absolutePath}`);
    console.log(`  - Total entries: ${NUM_USERS}`);
    console.log(`  - Columns: email (required), name (optional)`);
    console.log(`\nYou can now use this file to test the bulk upload feature.`);

  } catch (error) {
    console.error('✗ Error generating test file:', error.message);
    process.exit(1);
  }
};

// Run the script
main();
