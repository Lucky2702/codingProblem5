const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let dataBase = null;

const initializeDBandServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const movieObjToResObj = (resObj) => {
  return {
    movieId: resObj.movie_id,
    directorId: resObj.director_id,
    movieName: resObj.movie_name,
    leadActor: resObj.lead_actor,
  };
};
const directorDbToResponseDb = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};
// Get All API
app.get("/movies/", async (request, response) => {
  const getMoviesNameQuerry = `select movie_name from movie;`;
  const movieArr = await db.all(getMoviesNameQuerry);
  response.send(
    movieArr.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
// Get Movie by Id API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `select * from movie where movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movieObjToResObj(movie));
});
// post movie API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `insert into 
                            movie(director_id,movie_name, lead_actor )
                            values (${directorId},'${movieName}','${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});
// update movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const putMovieQuery = `update
                               movie
                             set 
                               director_id = ${directorId},
                               movie_name = '${movieName}',
                               lead_actor =   '${leadActor}'
                              where movie_id = ${movieId}; `;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});
// delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from 
                                  movie 
                                where
                                  movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
// Director API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select * from director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => directorDbToResponseDb(eachDirector))
  );
});
// Director Movie API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQuery = `select 
                                     movie_name
                                   from
                                     movie
                                   where
                                     director_id = ${directorId};`;
  const directorMovieArr = await db.all(directorMovieQuery);
  response.send(
    directorMovieArr.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
