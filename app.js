/* Create a table with name of todo in todoApplication.db. database.
CREATE TABLE todo(id INTEGER, todo TEXT, priority TEXT, status TEXT) INSERT INTO todo (id, todo, priority, status)
VALUES (1, "HTML", "HIGH", "TO DO"), (2, "CSS", "MEDIUM", "IN PROGRESS"), (3, "NODEJS", "LOW", "DONE");
*/

const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const hasPriarityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriarityPropertie = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusPropertie = requestQuery => {
  return requestQuery.status !== undefined
}

// api 1
app.get('/todos/', async (request, response) => {
  const {status, priority, search_q = ''} = request.query
  let data
  let getTodoQuery = ''
  switch (true) {
    case hasPriarityAndStatusProperties(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo
        LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority= '${priority}'`
      break
    case hasPriarityPropertie(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo
                LIKE '%${search_q}%'
                AND priority= '${priority}'`
      break
    case hasStatusPropertie(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo
                LIKE '%${search_q}%'
                AND status = '${status}'`
      break
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo
                LIKE '%${search_q}%'`
      break
  }

  data = await db.all(getTodoQuery)
  response.send(data)
})

// api2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId}`
  const todo = await db.get(getTodoQuery)
  response.send(todo)
})

// api3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const createTodoQuery = `INSERT INTO todo (id,todo,priority,status)
  VALUES (${id}, '${todo}', '${priority}','${status}')`
  const todoItem = await db.run(createTodoQuery)
  const {todoId} = todoItem.lastID
  response.send('Todo Successfully Added')
})

// api4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updatedColumn = ''
  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updatedColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updatedColumn = 'Todo'
      break
  }
  const getpreviousTodoQuery = `SELECT * FROM todo WHERE id= ${todoId}`
  const previousTodo = await db.get(getpreviousTodoQuery)
  console.log(previousTodo)
  const {
    status = previousTodo.status,
    priority = previousTodo.priority,
    todo = previousTodo.todo,
  } = request.body

  const updateTodoQuery = `UPDATE todo
   SET todo='${todo}',
   status='${status}',
   priority='${priority}'
   WHERE id = ${todoId} 
   `
  const updateTodo = await db.run(updateTodoQuery)
  console.log(updateTodo)
  response.send(`${updatedColumn} Updated`)
})

// api5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId}`
  const deleteTodo = await db.run(deleteQuery)
  console.log(deleteTodo)
  response.send('Todo Deleted')
})

module.exports = app
