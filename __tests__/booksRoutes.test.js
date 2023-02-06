process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");


describe("books Routes Test", function () {

    let testBook = {
        isbn: "0813041937",
        amazon_url: "https://www.amazon.com/Truth-Lies-Rings-Challenger-Disaster/dp/0813041937",
        author: "Allan J. McDonald",
        language: "English",
        pages: 648,
        publisher: "University Press of Florida",
        title: "Truth, Lies, and O-Rings: Inside the Space Shuttle Challenger Disaster",
        year: 2012
    };
    let testBook2 = {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
    };

    beforeEach(async function () {
        await db.query("DELETE FROM books");

        let bookDefault = await Book.create(testBook);
    });

    /** GET /books/ => books: [testBook]  */
    describe("GET /books", function () {
        test("returns all books", async function () {
            let response = await request(app)
                .get("/books");

            expect(response.body).toEqual({ books: [testBook] });
        });
    });


    /** GET /books/:id => book: testBook  */
    describe(`GET /books/${testBook.isbn}`, function () {
        test("returns a specific book", async function () {
            let response = await request(app)
                .get(`/books/${testBook.isbn}`);

            expect(response.body).toEqual({ book: testBook });
        });
    });

    /** POST /books/ => book: testBook2  */
    describe("POST /books, all fields", function () {
        test("add a new book", async function () {
            let response = await request(app)
                .post("/books")
                .send(testBook2);

            expect(response.status).toEqual(201);
            expect(response.body).toEqual({ book: testBook2 });
        });
    });

    /** POST /books/ with no body => 400 error  */
    describe("POST /books, all fields", function () {
        test("add a new book, no post data", async function () {
            let response = await request(app)
                .post("/books");

            expect(response.status).toEqual(400);
            expect(response.body.message).toEqual(
                [
                    "instance requires property \"isbn\"",
                    "instance requires property \"amazon_url\"",
                    "instance requires property \"author\"",
                    "instance requires property \"language\"",
                    "instance requires property \"pages\"",
                    "instance requires property \"publisher\"",
                    "instance requires property \"title\"",
                    "instance requires property \"year\""
                ]
            );
        });
    });


    /** POST /books/ missing isbn => 400 error  */
    describe("POST /books, missing isbn", function () {
        test("add a new book, missing isbn", async function () {
            let response = await request(app)
                .post("/books")
                .send({
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 264,
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                });

            expect(response.status).toEqual(400);
            expect(response.body.message).toEqual(
                [
                    "instance requires property \"isbn\"",
                ]
            );
        });
    });


    /** POST /books/ invalid year, pages => 400 error  */
    describe("POST /books, invalid year, pages", function () {
        test("add a new book, invalid year, pages", async function () {
            let response = await request(app)
                .post("/books")
                .send({
                    isbn: "0691161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: "264",
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: "2017"
                });

            expect(response.status).toEqual(400);
            expect(response.body.message).toEqual(
                [
                    "instance.pages is not of a type(s) integer",
                    "instance.year is not of a type(s) integer"
                ]
            );
        });
    });


    /** POST /books/ book already exists => 500 error  */
    describe("POST /books, invalid year, pages", function () {
        test("add a new book, invalid year, pages", async function () {
            let response = await request(app)
                .post("/books")
                .send(testBook);

            expect(response.status).toEqual(500);
            expect(response.body.message).toEqual(
                "duplicate key value violates unique constraint \"books_pkey\""
            );
        });
    });


    /** PUT /books/:isbn update an existing book => book: {updatedBook}  */
    describe("PUT /books/:ISBN, all req'd fields valid", function () {
        test("update the year, author, and languages", async function () {
            let response = await request(app)
                .put(`/books/${testBook.isbn}`)
                .send({
                    amazon_url: "https://www.amazon.com/Truth-Lies-Rings-Challenger-Disaster/dp/0813041937",
                    author: "Allan J. McDonald, James R. Hansen",
                    language: "English, Spanish",
                    pages: 648,
                    publisher: "University Press of Florida",
                    title: "Truth, Lies, and O-Rings: Inside the Space Shuttle Challenger Disaster",
                    year: 2000
                });

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                book: {
                    isbn: testBook.isbn,
                    amazon_url: "https://www.amazon.com/Truth-Lies-Rings-Challenger-Disaster/dp/0813041937",
                    author: "Allan J. McDonald, James R. Hansen",
                    language: "English, Spanish",
                    pages: 648,
                    publisher: "University Press of Florida",
                    title: "Truth, Lies, and O-Rings: Inside the Space Shuttle Challenger Disaster",
                    year: 2000
                }
            });
        });
    });


    /** PUT /books/:isbn incorrect isbn   */
    describe("PUT /books/:ISBN, isbn does not exist", function () {
        test("update error: isbn not found", async function () {
            let testISBN = "fubar";
            let response = await request(app)
                .put(`/books/${testISBN}`)
                .send({
                    amazon_url: "https://www.amazon.com/Truth-Lies-Rings-Challenger-Disaster/dp/0813041937",
                    author: "Allan J. McDonald",
                    language: "English",
                    pages: 648,
                    publisher: "University Press of Florida",
                    title: "Truth, Lies, and O-Rings: Inside the Space Shuttle Challenger Disaster",
                    year: 2012
                });

            expect(response.status).toEqual(404);
            expect(response.body.message).toEqual(
                `There is no book with an isbn '${testISBN}`
            );
        });
    });


    /** PUT /books/:isbn isbn correct, missing author, languages, publisher, year */
    describe("PUT /books/:ISBN, isbn correct, missing author, languages, publisher, year", function () {
        test("update errors: missing author, languages, publisher, year", async function () {
            let response = await request(app)
                .put(`/books/${testBook.isbn}`)
                .send({
                    amazon_url: "https://www.amazon.com/Truth-Lies-Rings-Challenger-Disaster/dp/0813041937",
                    pages: 648,
                    title: "Truth, Lies, and O-Rings: Inside the Space Shuttle Challenger Disaster"
                });

            expect(response.status).toEqual(400);
            expect(response.body.message).toEqual(
                [
                    "instance requires property \"author\"",
                    "instance requires property \"language\"",
                    "instance requires property \"publisher\"",
                    "instance requires property \"year\""
                ]
            );
        });
    });


    /** DELETE /books/:isbn isbn correct => message: "Book deleted" */
    describe("DELETE /books/:ISBN, isbn correct, book is deleted", function () {
        test("delete a book", async function () {
            let response = await request(app)
                .delete(`/books/${testBook.isbn}`);

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({ message: "Book deleted" });
        });

    });


    /** DELETE /books/:isbn isbn does not exist */
    describe("DELETE /books/:ISBN, isbn does not exist", function () {
        test("delete a book with incorrect isbn", async function () {
            let testISBN = "fubar";
            let response = await request(app)
                .delete(`/books/${testISBN}`);

            expect(response.status).toEqual(404);
            expect(response.body.message).toEqual(
                `There is no book with an isbn '${testISBN}`
            );
        });

    });


    afterAll(async function () {
        await db.end();
    });

});