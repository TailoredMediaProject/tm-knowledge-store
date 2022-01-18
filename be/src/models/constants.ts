// eslint-disable-next-line no-undef
export const HOST = process.env.BE_HOST || 'data.tmedia.redlink.io';
export const HEADER_IF_UNMODIFIED_SINCE = 'If-Unmodified-Since';
export const HEADER_ACCEPT = 'Accept';
export const HEADER_CONTENT_TYPE = 'Content-Type';
export const MIME_TYPE_TURTLE = 'text/turtle';
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
