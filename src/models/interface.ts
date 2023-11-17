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

