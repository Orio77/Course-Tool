import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
    try {
        console.log("Post method reached")
        const body = await req.json()
        const { courseId } = body
        const course = await prisma.course.findUnique({
                where: { id: courseId },
                include: { units: { include: { chapters: true } } },
            });

            if (!course) {
                throw new Error('Course not found');
            }

            let unlockNextUnit = false;

            for (const unit of course.units) {
                if (unlockNextUnit) {
                    await prisma.unit.update({
                        where: {id: unit.id},
                        data: {isUnlocked: true}
                    })

                    for (const chapter of unit.chapters) {
                        await prisma.chapter.update({
                            where: { id: chapter.id },
                            data: { isUnlocked: true },
                        });
                        return NextResponse.json({ message: 'Chapter unlocked successfully.' }, { status: 200 });
                    }
                }
                for (const chapter of unit.chapters) {
                    if (!chapter.isUnlocked) {
                        await prisma.chapter.update({
                            where: { id: chapter.id },
                            data: { isUnlocked: true },
                        });
                        break;
                    }
                }
                unlockNextUnit = unit.chapters.every(chapter => chapter.isUnlocked);
                if (!unlockNextUnit) {
                    return NextResponse.json({ message: 'Chapter unlocked successfully.' }, { status: 200 });
                }
        }
        return NextResponse.json({ message: 'No chapters to unlock or already unlocked.' }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        console.error('An unknown error occurred');
            return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
      }
    }
}
