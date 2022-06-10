// eslint-disable-next-line no-undef
export const HOST = process.env.BE_HOST || 'data.tmedia.redlink.io';
// eslint-disable-next-line no-undef
export const BASE_URI_NDB = process.env.BASE_URL_NDB || 'normdb.ivz.cn.ard.de';
export const HEADER_IF_UNMODIFIED_SINCE = 'If-Unmodified-Since';
export const HEADER_ACCEPT = 'Accept';
export const HEADER_CONTENT_TYPE = 'Content-Type';
export const MIME_TYPE_TURTLE = 'text/turtle';
export const MIME_TYPE_RDF_XML = 'application/rdf+xml';
export const MIME_TYPE_N3 = 'text/n3';
export const PROPERTY_MAPPING_CONFIG = {
  entity: {
    prefixUrl: 'http://purl.org/dc/terms/',
    prefix: 'dc',
    properties: {
      label: 'title',
      description: 'description',
      created: 'created',
      lastModified: 'modified'
    }
  }
};
export const DB_COLLECTION_VOCABULARIES = 'vocabularies';
export const DB_COLLECTION_ENTITIES = 'entities';
export const AUTOMATIC_ANALYSIS_SHOT_CLASSES_VOCABULARY = 'automatic-analysis';
const AA_SHOT_CLASSES_BASE = '../assets/shot-classes/Johanneum_Shot-Classes_';
export const AUTOMATIC_ANALYSIS_SHOT_CLASSES_FILE = `${AA_SHOT_CLASSES_BASE}mapped_v2.csv`;
export const AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP = `${AA_SHOT_CLASSES_BASE}backup.json`;
export const AUTOMATIC_ANALYSIS_SHOT_CLASSES_ID_LIST = `${AA_SHOT_CLASSES_BASE}Id_List.json`;
