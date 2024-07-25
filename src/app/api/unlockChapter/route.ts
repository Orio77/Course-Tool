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

            let found = false;
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
                        return;
                    }
                }
                for (const chapter of unit.chapters) {
                    if (!chapter.isUnlocked) {
                        await prisma.chapter.update({
                            where: { id: chapter.id },
                            data: { isUnlocked: true },
                        });
                        found = true;
                    }
                }
                if (found) {
                    unlockNextUnit = unit.chapters.every(chapter => chapter.isUnlocked);
                    if (!unlockNextUnit) {
                        return;
                    }
                }
        }
        return new NextResponse(null, {status: 200})
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(500, error.message)
        return new NextResponse(null, {status: 500})
      } else {
        console.log('An unknown error occurred', 500)
        return new NextResponse(null, {status: 500})
      }
    }
}
