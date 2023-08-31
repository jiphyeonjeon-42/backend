export type RawProject = {
  id: number;
  occurrence: number;
  final_mark: number;
  status: string;
  'validated?': boolean;
  current_team_id: number;
  project: {
    id: number;
    name: string;
    slug: string;
    parent_id: number;
  };
  cursus_ids: number[];
  marked_at: string;
  marked: boolean;
  retriable_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    email: string;
    login: string;
    first_name: string;
    last_name: string;
    usual_full_name: string;
    usual_first_name: string;
    url: string;
    phone: string;
    displayname: string;
    kind: string;
    image: object;
    'staff?': boolean;
    correction_point: number;
    pool_month: string;
    pool_year: string;
    location: string;
    wallet: number;
    anonymize_date: string;
    data_erasure_date: string;
    created_at: string;
    updated_at: string;
    alumnized_at: string;
    'alumni?': boolean;
    'active?': boolean;
  };
  teams: object[];
}

export type Project = {
  id: RawProject['id'];
  status: RawProject['status'];
  validated: RawProject['validated?'];
  project: RawProject['project'];
  cursus_ids: RawProject['cursus_ids'];
  marked: RawProject['marked'];
  marked_at: RawProject['marked_at'];
}

export type ProjectFrom42 = {
  id: number;
  name: string;
  slug: string;
  difficulty: number;
  parent: [];
  children: [];
  attachments: [];
  created_at: string;
  updated_at: string;
  exam: boolean;
  git_id: number;
  repository: string;
  cursus: Cursus[];
  campus: Campus[];
  videos: [],
  project_sessions: object[];
}

export type Campus = {
  id: number;
  name: string;
  time_zone: string;
  language: {
    id: number;
    name: string;
    identifier: string;
    created_at: string;
    updated_at: string;
  };
  users_count: number;
  vogsphere_id: number;
  country: string;
  address: string;
  zip: string;
  city: string;
  website: string;
  facebook: string;
  twitter: string;
  active: boolean;
  public: boolean;
  email_extension: string;
  default_hidden_phone: boolean;
}

export type Cursus = {
  id: number;
  created_at: string;
  name: string;
  slug: string;
  kind: string;
}
