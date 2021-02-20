const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequest(request, response, next){
  
  const {method, url } = request;

  const logLabel = `[${ method.toUpperCase() }] ${url}`;

  console.time(logLabel);

  next(); //Proximo middleware

  console.timeEnd(logLabel);
  }
  
  function validateRepositoryID(request, response, next){

  const {id} = request.params;
  
  if (!isUuid(id)){

    return response.status(400).json({ error: 'Invalid project ID.'});

  }
  return next();
  }

app.use(logRequest);

app.use('/repositories/:id', validateRepositoryID);

app.use('/repositories/:id/like', validateRepositoryID);

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const result = title 
    ? repositories.filter(repository => repository.title.includes(title))
    : repositories;

  return response.json(result);

});

app.post("/repositories", (request, response) => {
  const { title, url, techs, likes } = request.body;

  const repository = {id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {

  const { id } = request.params;

  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  if (repositoryIndex == -1) {

  return response.status(400).json({ error: "Repository not found." });

}
  const repository = { 
    id, title, url, techs, 
    likes: repositories[repositoryIndex].likes };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {

  const { id } = request.params;

  const { title, url, techs, likes } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  if (repositoryIndex < 0){

  return response.status(400).json({ error: "Repository not found." });

}
repositories.splice(repositoryIndex,1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
 
  const { id } = request.params;

  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);

  if (repositoryIndex < 0) {

  return response.status(400).json({ error: "Repository not found." });

}
const repository = { 
  id, title, url, techs, 
  likes: repositories[repositoryIndex].likes + 1 };

  repositories[repositoryIndex] = repository;

  return response.json(repository);

});

module.exports = app;
