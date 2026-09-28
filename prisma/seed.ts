import { PrismaClient, UserRole, TicketStatus, TicketCategory, TicketPriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (in development)
  if (process.env.NODE_ENV === 'development') {
    await prisma.notification.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.ticketLog.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();
    await prisma.setting.deleteMany();
  }

  // Hash password for all demo users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create Director
  const director = await prisma.user.create({
    data: {
      name: 'Dr. Jane Wanjiku',
      email: 'director@kcau.ac.ke',
      passwordHash,
      role: UserRole.DIRECTOR,
      department: 'ICT Directorate',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  // Create Technicians
  const technicians = await Promise.all([
    prisma.user.create({
      data: {
        name: 'James Kamau',
        email: 'j.kamau@kcau.ac.ke',
        passwordHash,
        role: UserRole.TECHNICIAN,
        department: 'ICT Support - Hardware',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mary Achieng',
        email: 'm.achieng@kcau.ac.ke',
        passwordHash,
        role: UserRole.TECHNICIAN,
        department: 'ICT Support - Network',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Peter Ochieng',
        email: 'p.ochieng@kcau.ac.ke',
        passwordHash,
        role: UserRole.TECHNICIAN,
        department: 'ICT Support - Software',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);

  // Create Students
  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Wambui',
        email: 'alice.wambui@student.kcau.ac.ke',
        passwordHash,
        role: UserRole.STUDENT,
        registrationNo: 'BIT/2021/001',
        department: 'Business Information Technology',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Brian Otieno',
        email: 'brian.otieno@student.kcau.ac.ke',
        passwordHash,
        role: UserRole.STUDENT,
        registrationNo: 'BSC/2022/045',
        department: 'Computer Science',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Catherine Muthoni',
        email: 'catherine.muthoni@student.kcau.ac.ke',
        passwordHash,
        role: UserRole.STUDENT,
        registrationNo: 'BBM/2023/112',
        department: 'Business Management',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Kiprop',
        email: 'david.kiprop@student.kcau.ac.ke',
        passwordHash,
        role: UserRole.STUDENT,
        registrationNo: 'DIT/2022/078',
        department: 'Information Technology',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Esther Nyambura',
        email: 'esther.nyambura@student.kcau.ac.ke',
        passwordHash,
        role: UserRole.STUDENT,
        registrationNo: 'BCOM/2021/203',
        department: 'Commerce',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);

  // Create sample tickets
  const ticketData = [
    {
      title: 'Wi-Fi not connecting in Library 2nd Floor',
      description: 'Unable to connect to KCA-Student Wi-Fi on the 2nd floor of the main library. Keeps saying "Authentication failed" even with correct credentials. Tried forgetting network and reconnecting.',
      category: TicketCategory.WIFI_NETWORK,
      priority: TicketPriority.HIGH,
      status: TicketStatus.RESOLVED,
      deviceInfo: 'MacBook Pro 2022, iPhone 14',
      location: 'Main Library, 2nd Floor, Study Area B',
      createdById: students[0].id,
      assignedToId: technicians[1].id,
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Student Portal login error 500',
      description: 'Getting "Internal Server Error" when trying to log into the student portal (portal.kcau.ac.ke). Works fine on mobile data but fails on campus Wi-Fi. Need to access exam timetable urgently.',
      category: TicketCategory.PORTAL_SOFTWARE,
      priority: TicketPriority.CRITICAL,
      status: TicketStatus.IN_PROGRESS,
      deviceInfo: 'Dell Latitude 5420, Windows 11',
      location: 'Computer Lab 304',
      createdById: students[1].id,
      assignedToId: technicians[2].id,
    },
    {
      title: 'Projector not displaying in Lecture Hall LH-101',
      description: 'Epson projector in LH-101 shows "No Signal" when connected via HDMI. Tried multiple laptops and cables. Lectures starting in 30 minutes.',
      category: TicketCategory.HARDWARE,
      priority: TicketPriority.HIGH,
      status: TicketStatus.ASSIGNED,
      deviceInfo: 'Epson EB-982W Projector',
      location: 'Lecture Hall LH-101, Block A',
      createdById: students[2].id,
      assignedToId: technicians[0].id,
    },
    {
      title: 'Slow internet in Hostel Block C',
      description: 'Wi-Fi in Hostel Block C rooms 200-220 is extremely slow (< 1 Mbps). Cannot attend online classes or download study materials. Issue started yesterday evening.',
      category: TicketCategory.WIFI_NETWORK,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      deviceInfo: 'HP Pavilion Laptop, Samsung Phone',
      location: 'Hostel Block C, Rooms 200-220',
      createdById: students[3].id,
    },
    {
      title: 'Printer jam in ICT Centre',
      description: 'HP LaserJet Pro M404dn in ICT Centre keeps jamming on page 2 of every print job. Tried clearing jam but it recurs. Students cannot print assignments.',
      category: TicketCategory.HARDWARE,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.CLOSED,
      deviceInfo: 'HP LaserJet Pro M404dn',
      location: 'ICT Centre, Ground Floor',
      createdById: students[4].id,
      assignedToId: technicians[0].id,
      resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Moodle assignment submission failing',
      description: 'Cannot submit assignment on Moodle (moodle.kcau.ac.ke). Clicking "Submit" does nothing, no error message. Deadline is tomorrow 11:59 PM.',
      category: TicketCategory.PORTAL_SOFTWARE,
      priority: TicketPriority.HIGH,
      status: TicketStatus.REOPENED,
      deviceInfo: 'Lenovo ThinkPad, Chrome Browser',
      location: 'Computer Lab 201',
      createdById: students[0].id,
      assignedToId: technicians[2].id,
      resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Monitor flickering in Lab 105',
      description: 'Monitor at workstation 12 in Lab 105 flickers constantly, causing eye strain. Happens with both DisplayPort and HDMI cables.',
      category: TicketCategory.HARDWARE,
      priority: TicketPriority.LOW,
      status: TicketStatus.OPEN,
      deviceInfo: 'Dell UltraSharp U2419H Monitor',
      location: 'Computer Lab 105, Workstation 12',
      createdById: students[1].id,
    },
    {
      title: 'Email not receiving external messages',
      description: 'Student email (student.kcau.ac.ke) not receiving emails from external domains (Gmail, Yahoo, etc.). Can send out but not receive. Missing important communications.',
      category: TicketCategory.PORTAL_SOFTWARE,
      priority: TicketPriority.HIGH,
      status: TicketStatus.ASSIGNED,
      deviceInfo: 'Webmail, Outlook App',
      location: 'N/A - Email System',
      createdById: students[2].id,
      assignedToId: technicians[2].id,
    },
  ];

  // Init ticket counter for current year
  const currentYear = new Date().getFullYear();
  const counterKey = `ticketCounter-${currentYear}`;
  let counter = 0;

  for (const [index, ticket] of ticketData.entries()) {
    counter++;
    const sequentialId = `HD-${currentYear}-${String(counter).padStart(4, '0')}`;
    const createdTicket = await prisma.ticket.create({
      data: {
        id: sequentialId,
        ...ticket,
        createdAt: new Date(Date.now() - (ticketData.length - index) * 24 * 60 * 60 * 1000),
      },
    });

    // Create ticket logs
    const logs = [];
    if (ticket.status !== TicketStatus.OPEN) {
      logs.push({
        ticketId: createdTicket.id,
        changedById: ticket.assignedToId || director.id,
        oldStatus: TicketStatus.OPEN,
        newStatus: TicketStatus.ASSIGNED,
        note: 'Assigned to technician',
        timestamp: new Date(createdTicket.createdAt.getTime() + 30 * 60 * 1000),
      });
    }
    if (ticket.status === TicketStatus.IN_PROGRESS || ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
      logs.push({
        ticketId: createdTicket.id,
        changedById: ticket.assignedToId!,
        oldStatus: TicketStatus.ASSIGNED,
        newStatus: TicketStatus.IN_PROGRESS,
        note: 'Started investigation',
        timestamp: new Date(createdTicket.createdAt.getTime() + 2 * 60 * 60 * 1000),
      });
    }
    if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
      logs.push({
        ticketId: createdTicket.id,
        changedById: ticket.assignedToId!,
        oldStatus: TicketStatus.IN_PROGRESS,
        newStatus: TicketStatus.RESOLVED,
        note: 'Issue resolved - replaced faulty network switch port',
        timestamp: ticket.resolvedAt,
      });
    }
    if (ticket.status === TicketStatus.CLOSED) {
      logs.push({
        ticketId: createdTicket.id,
        changedById: ticket.createdById,
        oldStatus: TicketStatus.RESOLVED,
        newStatus: TicketStatus.CLOSED,
        note: 'Confirmed working',
        timestamp: ticket.closedAt,
      });
    }
    if (ticket.status === TicketStatus.REOPENED) {
      logs.push({
        ticketId: createdTicket.id,
        changedById: ticket.createdById,
        oldStatus: TicketStatus.RESOLVED,
        newStatus: TicketStatus.REOPENED,
        note: 'Issue persists - submission still fails on Chrome',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      });
    }

    await prisma.ticketLog.createMany({ data: logs });

    // Create comments
    const comments = [
      {
        ticketId: createdTicket.id,
        userId: ticket.createdById,
        message: 'Thank you for reporting this. Our team will investigate.',
        isInternal: false,
        createdAt: new Date(createdTicket.createdAt.getTime() + 15 * 60 * 1000),
      },
    ];

    if (ticket.assignedToId) {
      comments.push({
        ticketId: createdTicket.id,
        userId: ticket.assignedToId,
        message: 'Looking into this now. Will update shortly.',
        isInternal: false,
        createdAt: new Date(createdTicket.createdAt.getTime() + 45 * 60 * 1000),
      });
    }

    if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
      comments.push({
        ticketId: createdTicket.id,
        userId: ticket.assignedToId!,
        message: 'Fixed the issue. Please test and confirm.',
        isInternal: false,
        createdAt: new Date((ticket.resolvedAt || createdTicket.createdAt).getTime() - 30 * 60 * 1000),
      });
    }

    if (ticket.status === TicketStatus.CLOSED) {
      comments.push({
        ticketId: createdTicket.id,
        userId: ticket.createdById,
        message: 'Confirmed working now. Thank you!',
        isInternal: false,
        createdAt: ticket.closedAt!,
      });
    }

    if (ticket.status === TicketStatus.REOPENED) {
      comments.push({
        ticketId: createdTicket.id,
        userId: ticket.createdById,
        message: 'Still having the same issue. Tried on Firefox too.',
        isInternal: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      });
    }

    await prisma.comment.createMany({ data: comments });

    // Create notifications
    const notifications = [
      {
        userId: ticket.createdById,
        type: NotificationType.TICKET_CREATED,
        title: 'Ticket Submitted',
        message: `Your ticket "${ticket.title}" has been submitted and is being reviewed.`,
        ticketId: createdTicket.id,
        read: true,
        createdAt: createdTicket.createdAt,
      },
    ];

    if (ticket.assignedToId) {
      notifications.push(
        {
          userId: ticket.assignedToId,
          type: NotificationType.TICKET_ASSIGNED,
          title: 'New Ticket Assigned',
          message: `You have been assigned to ticket "${ticket.title}".`,
          ticketId: createdTicket.id,
          read: false,
          createdAt: new Date(createdTicket.createdAt.getTime() + 30 * 60 * 1000),
        },
        {
          userId: ticket.createdById,
          type: NotificationType.TICKET_STATUS_CHANGED,
          title: 'Ticket Status Updated',
          message: `Your ticket "${ticket.title}" has been assigned to a technician.`,
          ticketId: createdTicket.id,
          read: true,
          createdAt: new Date(createdTicket.createdAt.getTime() + 30 * 60 * 1000),
        }
      );
    }

    if (ticket.status !== TicketStatus.OPEN && ticket.status !== TicketStatus.ASSIGNED) {
      notifications.push({
        userId: ticket.createdById,
        type: NotificationType.TICKET_STATUS_CHANGED,
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.title}" status changed to ${ticket.status.replace('_', ' ')}.`,
        ticketId: createdTicket.id,
        read: ticket.status === TicketStatus.CLOSED,
        createdAt: ticket.resolvedAt || new Date(),
      });
    }

    await prisma.notification.createMany({ data: notifications });
  }

  // Create system settings including counter for sequential IDs
  await prisma.setting.createMany({
    data: [
      { key: 'auto_close_days', value: '7' },
      { key: 'ticket_id_prefix', value: 'HD' },
      { key: 'max_attachment_size', value: '5242880' },
      { key: 'allowed_mime_types', value: 'image/jpeg,image/png,image/gif,application/pdf,text/plain' },
      { key: 'email_notifications_enabled', value: 'true' },
      { key: counterKey, value: String(counter) },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`
  Demo Accounts (password: password123):
  - Director: director@kcau.ac.ke
  - Technicians: j.kamau@kcau.ac.ke, m.achieng@kcau.ac.ke, p.ochieng@kcau.ac.ke
  - Students: alice.wambui@student.kcau.ac.ke, brian.otieno@student.kcau.ac.ke, etc.
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });