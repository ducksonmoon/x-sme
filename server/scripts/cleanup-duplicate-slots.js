const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateSlots() {
  try {
    console.log('Starting cleanup of duplicate time slots...');

    // Find all duplicate slots
    const duplicates = await prisma.$queryRaw`
      SELECT 
        "serviceId", 
        date, 
        "startTime", 
        COUNT(*) as count,
        array_agg(id) as slot_ids
      FROM "TimeSlot" 
      GROUP BY "serviceId", date, "startTime" 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    console.log(`Found ${duplicates.length} groups of duplicate slots`);

    let totalRemoved = 0;

    for (const duplicate of duplicates) {
      const { serviceId, date, startTime, count, slot_ids } = duplicate;
      
      console.log(`Processing duplicates for service ${serviceId}, date ${date}, time ${startTime} (${count} slots)`);

      // Get all slots in this group
      const slots = await prisma.timeSlot.findMany({
        where: {
          id: { in: slot_ids }
        },
        orderBy: { createdAt: 'asc' } // Keep the oldest one
      });

      if (slots.length > 1) {
        // Keep the first (oldest) slot, remove the rest
        const slotsToRemove = slots.slice(1);
        
        // If any of the slots to remove are booked, transfer the booking to the kept slot
        const bookedSlots = slotsToRemove.filter(slot => slot.isBooked);
        const keptSlot = slots[0];

        if (bookedSlots.length > 0) {
          console.log(`  Found ${bookedSlots.length} booked slots to merge`);
          
          // Update the kept slot to be booked if any of the removed slots were booked
          await prisma.timeSlot.update({
            where: { id: keptSlot.id },
            data: { isBooked: true }
          });
        }

        // Remove the duplicate slots
        await prisma.timeSlot.deleteMany({
          where: {
            id: { in: slotsToRemove.map(slot => slot.id) }
          }
        });

        totalRemoved += slotsToRemove.length;
        console.log(`  Removed ${slotsToRemove.length} duplicate slots`);
      }
    }

    console.log(`Cleanup completed. Total slots removed: ${totalRemoved}`);

  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicateSlots()
  .then(() => {
    console.log('Cleanup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup script failed:', error);
    process.exit(1);
  }); 