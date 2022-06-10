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
const AA_BACKUP_SUFFIX = 'backup.json';
const AA_ID_LIST_SUFFIX = 'Id_List.json';
const AA_MAPPED_SUFFIX = 'mapped_v';
const AA_SHOT_CLASSES_BASE = '../assets/shot-classes/Johanneum_Shot-Classes_';
export const AUTOMATIC_ANALYSIS_SHOT_CLASSES_FILE = `${AA_SHOT_CLASSES_BASE}${AA_MAPPED_SUFFIX}2.csv`;
export const AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP = `${AA_SHOT_CLASSES_BASE}${AA_BACKUP_SUFFIX}`;
export const AUTOMATIC_ANALYSIS_SHOT_CLASSES_ID_LIST = `${AA_SHOT_CLASSES_BASE}${AA_ID_LIST_SUFFIX}`;
const AA_PERSONS_BASE = '../assets/persons/Johanneum_Persons_';
export const AUTOMATIC_ANALYSIS_PERSONS_FILE = `${AA_PERSONS_BASE}${AA_MAPPED_SUFFIX}1.csv`;
export const AUTOMATIC_ANALYSIS_PERSONS_BACKUP = `${AA_PERSONS_BASE}${AA_BACKUP_SUFFIX}`;
export const AUTOMATIC_ANALYSIS_PERSONS_ID_LIST = `${AA_PERSONS_BASE}${AA_ID_LIST_SUFFIX}`;
const AA_LOGOS_BASE = '../assets/logos/Johanneum_Logos_';
export const AUTOMATIC_ANALYSIS_LOGOS_FILE = `${AA_LOGOS_BASE}${AA_MAPPED_SUFFIX}1.csv`;
export const AUTOMATIC_ANALYSIS_LOGOS_BACKUP = `${AA_LOGOS_BASE}${AA_BACKUP_SUFFIX}`;
export const AUTOMATIC_ANALYSIS_LOGOS_ID_LIST = `${AA_LOGOS_BASE}${AA_ID_LIST_SUFFIX}`;
