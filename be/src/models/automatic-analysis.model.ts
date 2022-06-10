export interface AutomaticAnalysisModel {
  eId: string;
  label: string;
  entityType: string;
  tagTree: string;
  canonicalLink: URL;
}

export interface AutomaticAnalysisPerson {
  person: string;
  uuid: string;
}
