// persistence-service.ts:
var mongo = require('mongodb');
function create(entity) {
    // check required properties to be valid
    // add new entry for entity variable in DB
    // Return new id (or whole entity object)
    mongo.add(entity);
    return entity;
}
console.log("hello world");
// update(entity)...
// read(id: number)...
// list()...
// delete(entity)...
//
// All for vocuabularies too
