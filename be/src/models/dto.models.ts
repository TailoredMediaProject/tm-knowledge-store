import {ObjectId} from "mongodb";

export interface VocabularyDTO {
  _id: ObjectId
  label: string
  description: string
  created: Date
  lastModified: Date
}

export interface EntityDTO {
  _id: ObjectId
  vocabulary: ObjectId
  type: string
  label: string
  description: string
  created: Date
  lastModified: Date
  externalResources: string[]
  sameAs: string[]
  data: any
}
