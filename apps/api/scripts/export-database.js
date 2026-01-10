const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
    console.log('Connecting to database...');

    // Fetch all users
    console.log('Fetching users...');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            firstName: true,
            lastName: true,
            role: true,
            verified: true,
            active: true,
            provider: true,
            createdAt: true,
            lastLoginAt: true,
        }
    });

    // Fetch all businesses
    console.log('Fetching businesses...');
    const businesses = await prisma.business.findMany({
        include: {
            owner: {
                select: { email: true, firstName: true, lastName: true }
            },
            category: {
                select: { name: true }
            }
        }
    });

    // Fetch all categories
    console.log('Fetching categories...');
    const categories = await prisma.category.findMany();

    // Fetch all reviews
    console.log('Fetching reviews...');
    const reviews = await prisma.review.findMany({
        include: {
            user: { select: { email: true, firstName: true } },
            business: { select: { name: true } }
        }
    });

    // Fetch all appointments
    console.log('Fetching appointments...');
    const appointments = await prisma.appointment.findMany({
        include: {
            user: { select: { email: true, firstName: true } },
            business: { select: { name: true } }
        }
    });

    // Fetch all services
    console.log('Fetching services...');
    const services = await prisma.service.findMany({
        include: {
            business: { select: { name: true } }
        }
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Users sheet
    const usersData = users.map(u => ({
        ID: u.id,
        Email: u.email,
        Username: u.username || '',
        Phone: u.phone || '',
        'First Name': u.firstName,
        'Last Name': u.lastName,
        Role: u.role,
        Verified: u.verified ? 'Yes' : 'No',
        Active: u.active ? 'Yes' : 'No',
        Provider: u.provider || 'Email',
        'Created At': u.createdAt?.toISOString() || '',
        'Last Login': u.lastLoginAt?.toISOString() || ''
    }));
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');

    // Businesses sheet
    const businessesData = businesses.map(b => ({
        ID: b.id,
        Name: b.name,
        Slug: b.slug,
        Category: b.category?.name || '',
        Description: b.description || '',
        'Owner Email': b.owner?.email || '',
        'Owner Name': `${b.owner?.firstName || ''} ${b.owner?.lastName || ''}`.trim(),
        Address: `${b.addressLine1}, ${b.city}, ${b.state} ${b.zipCode}`,
        Phone: b.phone,
        Email: b.email || '',
        Website: b.website || '',
        Rating: b.rating,
        'Review Count': b.reviewCount,
        'View Count': b.viewCount,
        Verified: b.verified ? 'Yes' : 'No',
        Active: b.active ? 'Yes' : 'No',
        Featured: b.featured ? 'Yes' : 'No',
        'Appointments Enabled': b.appointmentsEnabled ? 'Yes' : 'No',
        'Created At': b.createdAt?.toISOString() || ''
    }));
    const businessesSheet = XLSX.utils.json_to_sheet(businessesData);
    XLSX.utils.book_append_sheet(workbook, businessesSheet, 'Businesses');

    // Categories sheet
    const categoriesData = categories.map(c => ({
        ID: c.id,
        Name: c.name,
        Slug: c.slug,
        Description: c.description || '',
        Icon: c.icon || '',
        'Display Order': c.displayOrder,
        Active: c.active ? 'Yes' : 'No'
    }));
    const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

    // Reviews sheet
    const reviewsData = reviews.map(r => ({
        ID: r.id,
        Business: r.business?.name || '',
        'Reviewer Email': r.user?.email || '',
        'Reviewer Name': r.user?.firstName || '',
        Rating: r.rating,
        Title: r.title || '',
        Content: r.content || '',
        'Created At': r.createdAt?.toISOString() || ''
    }));
    const reviewsSheet = XLSX.utils.json_to_sheet(reviewsData);
    XLSX.utils.book_append_sheet(workbook, reviewsSheet, 'Reviews');

    // Appointments sheet
    const appointmentsData = appointments.map(a => ({
        ID: a.id,
        Business: a.business?.name || '',
        'Customer Email': a.user?.email || '',
        'Customer Name': a.user?.firstName || '',
        Status: a.status,
        Date: a.startTime?.toISOString()?.split('T')[0] || '',
        'Start Time': a.startTime?.toISOString() || '',
        'End Time': a.endTime?.toISOString() || '',
        Notes: a.notes || '',
        'Created At': a.createdAt?.toISOString() || ''
    }));
    const appointmentsSheet = XLSX.utils.json_to_sheet(appointmentsData);
    XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments');

    // Services sheet
    const servicesData = services.map(s => ({
        ID: s.id,
        Business: s.business?.name || '',
        Name: s.name,
        Description: s.description || '',
        Price: s.price,
        Duration: s.duration,
        Active: s.active ? 'Yes' : 'No'
    }));
    const servicesSheet = XLSX.utils.json_to_sheet(servicesData);
    XLSX.utils.book_append_sheet(workbook, servicesSheet, 'Services');

    // Summary sheet
    const summaryData = [
        { Metric: 'Total Users', Count: users.length },
        { Metric: 'Total Businesses', Count: businesses.length },
        { Metric: 'Total Categories', Count: categories.length },
        { Metric: 'Total Reviews', Count: reviews.length },
        { Metric: 'Total Appointments', Count: appointments.length },
        { Metric: 'Total Services', Count: services.length },
        { Metric: 'Verified Businesses', Count: businesses.filter(b => b.verified).length },
        { Metric: 'Active Users', Count: users.filter(u => u.active).length },
        { Metric: 'Export Date', Count: new Date().toISOString() },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Save the file
    const outputPath = path.join(__dirname, '..', '..', '..', 'tarsit_database_export.xlsx');
    XLSX.writeFile(workbook, outputPath);

    console.log(`\n✅ Data exported successfully to: ${outputPath}`);
    console.log('\nSummary:');
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Businesses: ${businesses.length}`);
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Reviews: ${reviews.length}`);
    console.log(`  - Appointments: ${appointments.length}`);
    console.log(`  - Services: ${services.length}`);

    await prisma.$disconnect();
}

exportData().catch(e => {
    console.error('Error:', e);
    prisma.$disconnect();
    process.exit(1);
});
