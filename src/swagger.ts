import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'KatyaSetu',
    description: 'A seamless bridge between ideas and execution. KaryaSetu helps teams collaborate, plan, and deliver projects efficiently – all in one place'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = [
  './dist/routes/auth.routes.js',
  './dist/routes/healthcheck.routes.js',
  './dist/routes/project.routes.js',
  './dist/routes/note.routes.js',
  './dist/routes/task.routes.js'
];


swaggerAutogen()(outputFile, routes, doc);