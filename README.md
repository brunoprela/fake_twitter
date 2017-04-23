Fake Twitter
==========

A running demo of the app can be found at: http://fritter-prela.herokuapp.com/


Running the app offline
-----------
This app uses MongoDB, so make sure you have that installed. Then you can just do:

git clone git@github.com:brunoprela/listify.git

cd listify-master

npm install

sudo mongod

npm start

go to http://localhost:3000/ in the browser


Running tests 
-----------

This app uses the framework Mocha for testing.

Navigate to the `test` directory in the command line and run

`mocha`

You should see a result like this:

```
  Array
    #indexOf()
      ✓ should return -1 when the value is not present
      ✓ should find values that exist
    #map
      ✓ should map values given a function
      ✓ should work on empty arrays


  4 passing (11ms)
```
