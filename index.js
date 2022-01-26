const express = require('express');
const { graphqlHTTP } = require('express-graphql');

const {
    GraphQLSchema, 
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const authors = [
    {id: 1, name: 'A'},
    {id: 2, name: 'B'},
    {id: 3, name: 'C'},
]

const books = [
    {id: 1, name: 'Abc', authorId: 1},
    {id: 3, name: 'Ghi', authorId: 1},
    {id: 2, name: 'Def', authorId: 1},
    {id: 4, name: 'Jkl', authorId: 2},
    {id: 5, name: 'Mno', authorId: 2},
    {id: 6, name: 'Pqr', authorId: 2},
    {id: 7, name: 'Stu', authorId: 3},
    {id: 8, name: 'Vwx', authorId: 3},
];

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents Author of the book',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter((book) => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book return by author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find((author) => author.id == book.authorId)
            }
        }
    })
}) 

const RootQueryType = new GraphQLObjectType({
     name: 'Query',
     description: 'Root Query',
     fields: () => ({
         book : {
            type: BookType,
            args: {
                id: {type: GraphQLInt}
            },
            description: 'A Single Book',
            resolve: (_, {id}) => {
                return books.find((book) => book.id == id)
            }
         },
         books: {
             type: new GraphQLList(BookType),
             description: 'List of books',
             resolve: () => books
         },
         author : {
            type: AuthorType,
            args: {
                id: {type: GraphQLInt}
            },
            description: 'A Single Author',
            resolve: (_, {id}) => {
                return authors.find((author) => author.id == id)
            }
         },
         authors : {
             type: new GraphQLList(AuthorType),
             description: 'List of Authors',
             resolve: () => authors
         }
     })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields : () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                };
                books.push(book);
                return book;
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

const app = express();

app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      graphiql: true,
    }),
  );

app.listen(1234., () => {
    console.log("Server is running on the port 1234")
})