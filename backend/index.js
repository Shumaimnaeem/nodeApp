const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('./db.js');
const routes = require('./routes/routes')
const app = express();
const Product = require('./models/products');


const { createServer } = require ('http');
const { execute, subscribe } = require ('graphql');
const { SubscriptionServer } = require ('subscriptions-transport-ws');
const { makeExecutableSchema } = require ('@graphql-tools/schema');

app.use(bodyParser.json());
app.use(cors({origin:'http://localhost:4200'}));


const {buildSchema} = require('graphql');
const {graphqlHTTP} = require('express-graphql');
const { KnownArgumentNamesOnDirectivesRule } = require('graphql/validation/rules/KnownArgumentNamesRule');
    
const {ApolloServer, gql} = require("apollo-server");
const { PubSub } = require ('graphql-subscriptions');
const pubsub = new PubSub();

const httpServer = createServer(app);


const typeDefs = gql`
type product {
    id : Int
    title : String!
    description : String
}

input ProductInput {
    id : Int
    title : String!
    description : String
}

type Query {
    hello : String
    getAllProducts : [product]
    getProductById(id: Int) : [product]
}

type Mutation {
    addProduct(id : Int, title : String! , description : String) : product
    updateProduct(id : Int, title : String! , description : String) : product
    deleteProduct(id : Int) : product
}

type Subscription {
    newProduct : product!
}`;


// const schema = buildSchema(`
//     type product {
//         id : Int
//         title : String!
//         description : String
//     }

//     type Query {
//         hello : String
//         getAllProducts : [product]
//         getProductById(id: Int) : [product]
//     }

//     input ProductInput {
//         id : Int
//         title : String!
//         description : String
//     }

//     type Mutation {
//         addProduct(id : Int, title : String! , description : String) : product
//         updateProduct(id : Int, title : String! , description : String) : product
//         deleteProduct(id : Int) : product
//     }

//     type Subscription {
//         newProduct : product!
//     }
// `)
const new_Prod = 'NEW_PROD'
const resolvers = {
    Subscription : {
        newProduct : {
            subscribe: (_ , __ , {pubsub}) => pubsub.asyncIterator(new_Prod)
        }
    },
    Query :{
        getAllProducts : async() => {
            let prod = await Product.find();
            console.log("All Products: ", prod)
            return prod;
        }
    },
    Mutation : {
        addProduct : (args) => {
        console.log("args",args)
        console.log("args.product: ", args.product)
        const prod = new Product({
            id : args.id,
            title : args.title,
            description : args.description
        });
        pubsub.publish(new_Prod,{
            newProduct : prod
        });
        prod.save();
        console.log("Prod: ", prod)
        return args.product;
        }
    },
    Mutation : {
        updateProduct : (args) => {
            console.log("Upadte: ", args)
            Product.findOneAndUpdate({'id' : args.id}, args, function (err, post) {
                if (err) 
                    return next(err);
                console.log("Post: ", post)    
                return post;
            });
            // return args.product;
        }
    },
    Query : {
        getProductById : async (args) => {
            console.log("product by id: ", args)
            let prod = await Product.find({'id' : args.id});
            console.log("Prod: ", prod)
            return prod;

            // await Product.find({'id' : args.id},function (err, product) {
            //     if (err) 
            //         console.log("err: ", err);
            //     console.log("Prod: ", product)    
            //     return product;
            //   });
        }
    },
    Mutation : {
        deleteProduct : async(args) => {
        Product.findOneAndRemove({'id':args.id}, args, function (err, post) {
            if (err) 
                console.log("err: ", err);
            return post;
          });
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        };
      }
    }],
  });

 const subscriptionServer = SubscriptionServer.create({
    // This is the `schema` we just created.
    typeDefs, 
    resolvers,
    // These are imported from `graphql`.
    execute,
    subscribe,
 }, {
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // This `server` is the instance returned from `new ApolloServer`.
    path: server.graphqlPath,
 });

 

app.use('/graphql', graphqlHTTP({
    graphiql : true,
    schema : typeDefs,
    rootValue: resolvers
}))

server.listen(3000, () => {
    console.log("Server listening on port 3000");
})

// app.use('/', routes);
// app.get('/', function(req, res, next) {
//     res.send('Express RESTful API');
//   });

