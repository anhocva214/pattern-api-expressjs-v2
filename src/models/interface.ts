export type TSortProductBy =
  | "oldest"
  | "latest"
  | "minimum_total_pages"
  | "maximum_total_pages"
  | "minimum_file_size"
  | "maximum_file_size"
  | "publication_year_latest"
export interface IFilterProductBy {
  totalPages: {
    min: number;
    max: number;
  };
}

export type TAcResource =
  | "product"
  | "user"
  | "upload"
  | "orders"
  | "subscription"
  | "research_post"
  | "user_activities"
  | "transaction"
  | "statistics"
  | "citation.format_standards"
  | "key_spam"
export type TAcPermission = "readAny" | "createAny" | "updateAny" | "deleteAny";

export type TSortHealthyProductBy = "oldest" | "latest";

export interface ICities {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

export interface IDistricts {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

export interface IWards {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

