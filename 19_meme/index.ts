import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Meme = TaskType & {
  service: "https://renderform.io/";
  image: string;
  text: string;
};

type Response = {
  requestId: string;
  href: string;
};
const apiKey = process.env.RENDERFORM_KEY as string;
const templateId = "burly-banshees-bounce-justly-1821" as const;
const createMeme = async (imageUrl: string, text: string): Promise<any> => {
  const response = await fetch("https://get.renderform.io/api/v2/render", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template: templateId,
      data: {
        "title.text": text,
        "image.src": imageUrl,
      },
    }),
  });
  return response.json();
};

const meme = async () => {
  const data = await useTaskData<Meme>("meme");
  console.log(data);
  if (!data) return;
  try {
    const meme: Response = await createMeme(data.task.image, data.task.text);
    const answer = {
      token: data?.token,
      answer: meme.href,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

meme();
