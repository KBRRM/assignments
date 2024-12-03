import { client } from '../..';
import { createUser, getUser } from '../user';
import { createTables, dropTables } from '../setup';
import { createTodo, updateTodo, getTodos } from '../todo';

beforeAll(async () => {
    await client.connect();
    await dropTables(); // Ensuring the database is clean before tests
    await createTables(); // Set up the tables for testing
});

afterAll(async () => {
    await client.end(); // Close the connection to the database after tests
});

describe('User Database Operations', () => {

    test('createUser inserts a new user into the database', async () => {
        const username = 'testuser';
        const password = 'testpass';
        const name = 'Test User';

        await createUser(username, password, name);
        const userResult = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        
        // Ensure the user is inserted correctly
        expect(userResult.rows.length).toBe(1);
        expect(userResult.rows[0]).toHaveProperty('username', username);
        expect(userResult.rows[0]).toHaveProperty('name', name);
        expect(userResult.rows[0].password).toBe(password);
    });

    test('getUser retrieves a user by ID', async () => {
        // Ensure the user exists
        const userId = 1; // Assuming this user exists for the test
        
        const user = await getUser(userId);
        
        // Validate if the user is fetched correctly by ID
        expect(user).toHaveProperty('id', userId);
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('name');
        expect(user.id).toBeGreaterThan(0); // Ensure the user has a valid ID
    });
});

describe('Todo Operations', () => {
    let userId: number;

    beforeAll(async () => {
        // Setup: Get userId of the test user
        const res = await client.query('SELECT id FROM users WHERE username = $1', ['testuser']);
        userId = res.rows[0]?.id;

        if (!userId) {
            throw new Error('User not found');
        }
    });

    test('createTodo inserts a new todo for a user', async () => {
        const title = 'Test Todo';
        const description = 'Test Description';
        
        const todo = await createTodo(userId, title, description);
        
        expect(todo).toHaveProperty('id');
        expect(todo).toHaveProperty('user_id', userId);  // Ensure it belongs to the correct user
        expect(todo.title).toBe(title);
        expect(todo.description).toBe(description);
        expect(todo.done).toBe(false);  // Default value for 'done' is false
    });

    test('updateTodo marks a todo as done', async () => {
        // Create a todo to update
        const { id: todoId } = await createTodo(userId, 'Update Test', 'To be updated');
        
        const updatedTodo = await updateTodo(todoId);
        
        // Ensure the todo status is marked as done
        expect(updatedTodo.done).toBe(true);
    });

    test('getTodos retrieves all todos for a user', async () => {
        // Create multiple todos for the user
        await createTodo(userId, 'Test Todo 1', 'Description 1');
        await createTodo(userId, 'Test Todo 2', 'Description 2');

        const todos = await getTodos(userId);
        
        // Ensure that todos are fetched correctly
        expect(todos.length).toBeGreaterThan(0);
        todos.forEach(todo => {
            expect(todo).toHaveProperty('id');
            expect(todo.user_id).toEqual(userId); // Ensure the todo belongs to the correct user
        });
    });
});
