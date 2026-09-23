const bcrypt = require("bcryptjs");
const prisma = require("../database");

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@movemate.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: "admin", passwordHash },
    create: {
      name: "MoveMate Admin",
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "admin",
    },
  });

  const route = await prisma.shuttleRoute.findFirst({ where: { name: "Main Campus Route" } })
    || await prisma.shuttleRoute.create({
      data: {
        name: "Main Campus Route",
        description: "Main campus shuttle route",
        startLocation: "Legon Hall",
        endLocation: "University of Ghana Main Gate",
      },
    });

  const stopData = [
    ["Legon Hall", 5.6508, -0.1869],
    ["University of Ghana Main Gate", 5.6502, -0.1876],
    ["Balme Library", 5.6519, -0.1871],
  ];

  for (const [name, latitude, longitude] of stopData) {
    const stop = await prisma.stop.findFirst({ where: { name } })
      || await prisma.stop.create({ data: { name, latitude, longitude } });

    await prisma.routeStop.upsert({
      where: { routeId_stopId: { routeId: route.id, stopId: stop.id } },
      update: { stopOrder: stopData.findIndex(([stopName]) => stopName === name) + 1 },
      create: { routeId: route.id, stopId: stop.id, stopOrder: stopData.findIndex(([stopName]) => stopName === name) + 1 },
    });
  }

  const shuttleCount = await prisma.shuttle.count();
  const shuttles = shuttleCount > 0
    ? await prisma.shuttle.findMany({ orderBy: { id: "asc" }, take: 3 })
    : await prisma.$transaction([
      prisma.shuttle.create({ data: { name: "Bani", plateNumber: "MM-001", status: "inactive", currentRouteId: route.id } }),
      prisma.shuttle.create({ data: { name: "Evandi", plateNumber: "MM-002", status: "inactive", currentRouteId: route.id } }),
      prisma.shuttle.create({ data: { name: "TF", plateNumber: "MM-003", status: "inactive", currentRouteId: route.id } }),
    ]);

  const shuttle = shuttles[0];
  const existingLocation = await prisma.shuttleLocation.findFirst({ where: { shuttleId: shuttle.id } });
  if (!existingLocation) {
    await prisma.shuttleLocation.create({
      data: {
        shuttleId: shuttle.id,
        latitude: 5.6508,
        longitude: -0.1869,
        placeName: "Legon Hall",
        speedKmh: 20,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });