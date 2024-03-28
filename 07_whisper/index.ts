import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Whisper = TaskType & {
  hint: string;
};

const regex = /^https:\/\/.*$/;
const whisper = async () => {
  const data = await useTaskData<Whisper>("whisper");
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    // @ts-expect-error
    const link = data.task.msg.match(/https:\/\/\S+/)[0];
    const blobUrl = await fetch(link);
    const blob = await blobUrl.blob();
    const file = new File([blob], "ai.mp3");

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
    });
    console.log(transcription);
    const answer = {
      token: data?.token,
      answer: transcription.text,
    };
    await sendAnswer(answer);
    console.log(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

whisper();
