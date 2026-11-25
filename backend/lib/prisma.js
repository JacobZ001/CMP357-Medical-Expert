/* ===== lib/prisma.js =====
   We create ONE Prisma client and share it with every route file.
   (In the lecture the client was created inside app.js. Since we now
   have many route files, we create it once here and import it.) */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = prisma;
