import { NextApiRequest, NextApiResponse } from 'next';
import { unlockNextChapter } from '../course/createChapters/route'; // Adjust this path if necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
