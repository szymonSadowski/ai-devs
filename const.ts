export const endpoints = {
  token: process.env.AI_DEVS_URL + "/token/",
  task: {
    getTask: process.env.AI_DEVS_URL + "/task/",
    answerTask: process.env.AI_DEVS_URL + "/answer/",
  },
};
