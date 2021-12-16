import {ObjectId} from "mongodb";

export interface Vocabulary {
    _id: ObjectId
    label: string
    description: string
    created: Date
    lastModified: Date
}

export interface Entity {
    _id: ObjectId
    vocabulary: ObjectId
    type: string
    label: string
    description: string
    created: Date
    lastModified: Date
    externalResources: string[]
    sameAs: string[]
    data: unknown,
}
