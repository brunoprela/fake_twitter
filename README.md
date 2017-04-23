Using Mocha
==========

Check out the [Mocha documentation](https://mochajs.org/) for more info.

Step 1 - Install Mocha Command Line Tool
---------------
Install the Mocha command line tool globally.

`npm install -g mocha`

You may need to run this command with higher permissions if it gives you an error. On Linux/MacOS,
that would be:

`sudo npm install -g mocha`

See [here](http://www.howtogeek.com/howto/windows-vista/run-a-command-as-administrator-from-the-windows-vista-run-box/) for how to run command as administrator on Windows

Step 2 - Create a Test Directory and File
--------------
Create a directory called `test` - all your tests will go in here.

Inside that directory, let's make a sample file, call it `test.js`.

Step 3 - Write a Test
--------------
Put the following code inside `test.js`.

```
var assert = require("assert");

// Array is the module under test.
describe('Array', function() {
  // indexOf is the method under test.
  describe('#indexOf()', function () {
    
    // This is a test, we indicate what we're testing for.
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });


    // Another test.
    it('should find values that exist', function() {
      assert.equal(0, [1, 2, 3].indexOf(1));
      assert.equal(2, [1, 2, 3].indexOf(3));
    });

  }); // End describe indexOf.

  // map is the method under test.
  describe('#map', function() {
    
    // This is a test.
    it('should map values given a function', function() {
      assert.deepEqual([2, 4, 6], [1, 2, 3].map(function(x) { return 2 * x; }));
    });


    // Another test.
    it('should work on empty arrays', function() {
      assert.deepEqual([], [].map(function(x) { return 2 * x; }));
    });

  }); // End describe map.

}); // End describe Array.
```
Step 4 - Run the Tests
-----------
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
