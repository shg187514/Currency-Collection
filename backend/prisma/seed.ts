import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding database...');

  // Create Tags
  const tagImportant = await prisma.tag.upsert({
    where: { name: 'Important' },
    update: {},
    create: { name: 'Important', color: '#ff0000' },
  });

  const tagProject = await prisma.tag.upsert({
    where: { name: 'Project' },
    update: {},
    create: { name: 'Project', color: '#00ff00' },
  });

  // Create Root Node
  const rootNode = await prisma.node.create({
    data: {
      title: 'Root Folder',
      content: 'This is the top-level node.',
      tags: {
        connect: [{ id: tagProject.id }],
      },
      histories: {
        create: {
          action: 'CREATED',
          changes: JSON.stringify({ title: 'Root Folder', content: 'This is the top-level node.' }),
        },
      },
    },
  });

  // Create Child Node
  const childNode = await prisma.node.create({
    data: {
      title: 'Design Specs',
      content: 'Details about the design system.',
      parentId: rootNode.id,
      tags: {
        connect: [{ id: tagImportant.id }, { id: tagProject.id }],
      },
      comments: {
        create: {
          content: 'We need to finalize the primary button color soon.',
        },
      },
      attachments: {
        create: {
          filename: 'mockup.png',
          url: '/uploads/mockup.png',
          size: 102400, // 100kb
          mimeType: 'image/png',
        },
      },
      histories: {
        create: {
          action: 'CREATED',
          changes: JSON.stringify({ title: 'Design Specs' }),
        },
      },
    },
  });

  // Create Nested Child Node
  const subChildNode = await prisma.node.create({
    data: {
      title: 'Color Palette',
      content: 'Primary: #3b82f6',
      parentId: childNode.id,
      histories: {
        create: {
          action: 'CREATED',
        },
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log('Root Node ID:', rootNode.id);
  console.log('Child Node ID:', childNode.id);
  console.log('SubChild Node ID:', subChildNode.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
