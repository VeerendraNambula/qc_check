import { PrismaClient, Role, TaskStatus, ResponseStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');

    // 1. Create a Test Inspector
    const inspector = await prisma.user.upsert({
        where: { id: 'test-inspector-uuid' },
        update: {},
        create: {
            id: 'test-inspector-uuid',
            name: 'John Doe',
            username: 'admin',
            password: await bcrypt.hash('password123', 10),
            role: Role.USER,
        },
    });

    console.log('User created:', inspector.name);

    // 2. Create a Sample Task
    const task = await prisma.qcTask.upsert({
        where: { id: 'sample-task-001' },
        update: {},
        create: {
            id: 'sample-task-001',
            title: 'Monthly Safety Inspection',
            description: 'Standard facility check for safety compliance.',
            status: TaskStatus.IN_PROGRESS,
            assignedToId: inspector.id,
            checklists: {
                create: [
                    { title: 'Fire Extinguisher Pressure Check', order: 1 },
                    { title: 'Emergency Exit Lighting Functional', order: 2 },
                    { title: 'First Aid Kit Restocked', order: 3 },
                    { title: 'Waste Management Compliance', order: 4 },
                ],
            },
        },
        include: { checklists: true },
    });

    console.log('Task created:', task.title);

    // 3. Add a sample response to one item (if checklists exist and not already responded)
    if (task.checklists.length > 0) {
        const firstChecklist = task.checklists[0];
        const existingResponse = await prisma.qcResponse.findUnique({
            where: { checklistId: firstChecklist.id }
        });

        if (!existingResponse) {
            await prisma.qcResponse.create({
                data: {
                    checklistId: firstChecklist.id,
                    status: ResponseStatus.APPROVED,
                    comment: 'Pressure gauge is in the green zone.',
                    imageUrl: '/uploads/sample-fire-extinguisher.jpg',
                },
            });
            console.log('Sample response added.');
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
