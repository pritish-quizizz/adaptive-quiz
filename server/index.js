const OPEN_API_KEY = '';
const ASSISTANT_ID = 'asst_kQdqo6eVrm3RldxDQE7sFxqL';
const ASSISTANT_PROMPT = 'You are now an adaptive quiz generator for school students.\
  \nYou will get an initial prompt and then use it to generate adaptive questions based on bloom levels.\
  \nEach question must be a multiple choice question with four options and only one correct answer.\
  \nThe user will reply A, B, C or D as their answer.\
  \nIf their answer is correct increase the bloom level for the next question, \
  if their answer is incorrect next question should be of a lower bloom level. \
  When asking a question do not include ANY explanations only provide a RFC8259 compliant JSON response following this format strictly without deviation.\n\
  {\
    "questionId": "<Question Number>",\
    "question": <QuestionText>,\
    "options": <Array of strings for the four options>,\
    "bloomLevel: <string for representing bloom level of question>\
  }\
  End the quiz when told to and reply with a summary as follows:\n\
  In the summary, for each question list the question and users choice, if user was incorrect list the correct answer aswell.\
  For the summary do not include any explanations and for the question details only provide a RFC8259 compliant JSON response following this format without deviation.\
  {\
    "summary":\
      [\
        {\
          "questionId": "Question Number",\
          "question": "QuestionText",\
          "options": <Array of strings for the four options for the question>,\
          "correctAnswer": "string for the correct answer for the question",\
          "userAnswer: "string for the option chosen by user",\
          "bloomLevel: <string for representing bloom level of question>,\
        }\
      ]\
  }'

const SOCKET_EVENT = {
  QUESTION: 'question',
  START: 'start',
  QUIZ_END: 'quizEnd',
  SUMMARY: 'summary'
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const openAI = require("openai");
const { start } = require('repl');

const openai = new openAI({apiKey: OPEN_API_KEY});


// Create an Express application
// Define a port to listen on
const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

async function basicChat(prompt='') {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt}],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.choices[0]);
  return completion;
}

async function createAssistant() { 
  const assistant = await openai.beta.assistants.create({
    name: "Adaptive Quiz Generator",
    instructions: ASSISTANT_PROMPT,
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o"
  });
  console.log('finished createAssistant');
  console.log({assistant});
}

async function getAssistant() {
  const myAssistant = await openai.beta.assistants.retrieve(
    ASSISTANT_ID
  );
  console.log(myAssistant);
}

function createUserMessage(content) {
  return {
    role: "user",
    content
  }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

let socketConnection = null;
let threadObj = null;
let questions = [];

// Define a simple route to handle GET requests to the root URL
app.get('/hello', (req, res) => {
    res.send('Hello, world!');
});

async function startNewThread() {
  threadObj = await openai.beta.threads.create();
  console.log({threadObj});
}

async function addMessageToThread(message) {
  const userMessage = createUserMessage(message);
  await openai.beta.threads.messages.create(
    threadObj.id,
    userMessage
  );
  console.log('addMessageToThread complete')
}

async function runThreadStream() {
  const run = openai.beta.threads.runs.stream(threadObj.id, {
    assistant_id: ASSISTANT_ID
  }).on('thread.message.completed', (reply) => {
    console.log({reply});
    // socketConnection.emit('message', reply.value);
  })
}

async function runThread(callback = () => {}) {
  let run = await openai.beta.threads.runs.createAndPoll(
    threadObj.id,
    {
      assistant_id: ASSISTANT_ID,
    }
  );
  if (run.status === 'completed') {
    callback();
  } else {
    console.log(run.status);
  }
}

async function addAndRunThread(message){
  await addMessageToThread(message);
  await runThread();
}

async function getLastAskedQuestion() {
  const messages = await openai.beta.threads.messages.list(
    threadObj.id
  );
  const reply = messages.data[0].content[0].text.value;
  console.log({reply});
  const questionObj = JSON.parse(reply);
  questions.push(questionObj);
  return questionObj;
}

async function initialiseQuiz(prompt){
  await addAndRunThread(prompt);
  const questionObj = await getLastAskedQuestion();
  socketConnection.emit(SOCKET_EVENT.QUESTION, questionObj);
}

async function handleNextQuestion(previousResponse){
  await addAndRunThread(previousResponse);
  const questionObj = await getLastAskedQuestion();
  socketConnection.emit(SOCKET_EVENT.QUESTION, questionObj);
}

async function handleQuizEnd(previousResponse){
  await addMessageToThread(previousResponse);
  await addAndRunThread('End the quiz and reply with summary only');
  const summaryObj = await getLastAskedQuestion();
  socketConnection.emit(SOCKET_EVENT.SUMMARY, summaryObj);
}

io.on('connection', (socket) => {
    console.log('New client connected');
    socketConnection = socket
    // createAssistant();
    // Send a message to the client
    socket.emit('message', 'Welcome to the Socket.IO server!');

    // Listen for messages from the client
    socket.on('message', async (message) => {
      console.log('socket message return');
    });

    // Start Quiz
    socket.on(SOCKET_EVENT.START, async (startData) => {
      console.log('initialising')
      await startNewThread();
      const initialPrompt = startData?.prompt || `The initial prompt is:\
      \ photosynthesis, the process by which green plants and certain other organisms transform light energy into chemical energy. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.\
      Stop asking the questions upon receiving "end quiz" message and give a summary of which answers were wrong and correct.\
      \nDirectly start with the first question now.`
      await initialiseQuiz(initialPrompt);
    });

    socket.on(SOCKET_EVENT.QUESTION, async (responseData = {}) => {
      const { response = 'A' } = responseData;
      await handleNextQuestion(response);
    });

    socket.on(SOCKET_EVENT.QUIZ_END, async (endData = {}) => {
      const { response = 'A' } = endData;
      await handleQuizEnd(response);
    });
  
    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });