

we have stripe and firebase, we add to firebase

with firebase you can create a reference to a file, then with uploadBytes you can use parameter ( and here you add the storageref and file)

then we do a .then(())

then we have upload and parametger with our values storageref, storage file blob file 











pro tip 1:: we can upload a single product at once, but we can do that in a loop, we can attribute that loop to a variable that returns all of them as one resolved promise, to await the entire promise loop, we can do promises.all, method that takes an iterable of promises and returns a sinmgle promise,

the returned promise fulfills when all of the input promises have resolved, it resolves with an array containgin the resolved values aof the input promises in the same order,

promise.all() method javascript array of promises reutrns a single promise


we ccan do our firebase  uploadBuytes with file reference, in a loop, entire amount of all filereferences from an array we loo0p and fire off entire array and have array of promises