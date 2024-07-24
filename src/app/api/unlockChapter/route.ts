import express, { Request, Response } from 'express';
import { unlockNextChapter } from '../course/createChapters/route';

const router = express.Router();

router.post('/unlockChapter', async (req: Request, res: Response) => {
    try {
        const { courseId } = req.body;
        await unlockNextChapter(courseId);
        res.status(200).send('Chapter unlocked successfully.');
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send('An unknown error occurred');
        }
    }
});

module.exports = router;
