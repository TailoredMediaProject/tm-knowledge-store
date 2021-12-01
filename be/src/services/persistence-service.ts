// persistence-service.ts:
let mongo = require('mongodb');

interface Entity {
    id: string
    vocabulary: Vocabulary
    canonicalLink: string
    created: Date
    lastModified: Date
    label: string
    description: string
    externalResources: Array<any>
    sameAs: Array<any>
    data: Array<any>}


interface Vocabulary {
    id: string
    created: Date
    lastModified: Date
    label: string
    description: string
    entityCount: number
}

function create(entity: Entity): Entity {
    // check required properties to be valid
    // add new entry for entity variable in DB
    // Return new id (or whole entity object)
    mongo.add(entity)


    return entity
}

console.log("hello world")


// update(entity)...
// read(id: number)...
// list()...
// delete(entity)...
//
// All for vocuabularies too