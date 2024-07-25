import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log("Post method reached")
      const { courseId } = req.body;
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
      res.status(200).send('Chapter unlocked successfully.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).send(error.message);
      } else {
        res.status(500).send('An unknown error occurred');
      }
    }
}
