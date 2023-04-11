import type { MpSdk, Vector3 } from "../../public/bundle/sdk";

export interface User {
  id: number,
  uuid: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  company_name: string;
  email: string;
  mobile: string;
  city: string;
  password: string;
  folder_uuid?: string;  //This currently does not exist in the db api but we need it otherwise we can't persist the users added to a tree Node
  roles: Array<Role>;
  group: USER_GROUP;
  group_id: number
}

// From Jay: should be small letters except fo root. We are following the api format. Pls don't change
export const enum FOLDER_TYPE{
  ROOT = "ROOT",
  SECTION = "section",
  FACILITY = "facility",
  SPACE = "space",
}

export interface Folder{
  uuid: string,
  parent_uuid: string,
  name: string,
  type_: FOLDER_TYPE,
  owner_uuid: string,
  json_data?: Section | Facility | Space,
  children?: Array<Folder>,
  users?: Array<SpaceUnitUser>,
  roles?: Array<Role>,
  categories?: Array<Category>,
  spaces?: Array<Space>,
}

export interface Folders {
  [key: string]: { 
    children: Array<Folders>,
    data: Folder
  }
}

export interface FolderUser {
  auth_user: {
    email: string,
    first_name: string,
    id: number,
    last_name: string,
    mobile: string,
    uuid: string
  }
  folder_users: {
    folder_uuid: string,
    json_data: any,
    uuid: string
  }
  name?: string
}

export interface Section {
  belonging_club: string,
  roles?: Array<Role>,
  categories?: Array<Category>,
  //other props for section
}

export interface Facility {
  belonging_club: string,
  roles?: Array<Role>,
  categories?: Array<Category>,
  users: Array<User>,
  //other props for facility
}

export interface Space {
  uuid: string, 
  folder_uuid: string, // space_sid
  owner_uuid: string, // space_sid
  space_sid: string, // space_sid
  space_name: string, // space_sid
  space_url: string, // space_url
  space_image?: string,
  memo1?: string,
  memo2?: string,

  //other props for space
}

export interface SpaceUnitUser {
  uuid: string,
  name: string,
  first_name: string,
  last_name: string,
  email: string,
  password?: string,
  owner?: string,
  folder_uuid?:string,
  roles: Array<Role>,
}

export interface Role {
  uuid: string,
  color: TagColor,
  name: string,
  folder_uuid?: string,
  json_data?: any,
  categories: Array<Category>,
}

export interface Category {
  uuid: string,
  name: string,
  color: TagColor,
  folder_uuid?: string,
  parent_uuid?: string,
  owner_uuid?:string,
  icon?:string,
  json_data?: {
    color: TagColor,
    icon?: string
  }
  subcategories: Array<Category>
}

export const enum TABLE_VIEW {
  LIST = "LIST",
  CARD = "CARD",
}

export const enum SPACE3D_SIDEBAR_VIEW {
  LIST = "LIST",
  FORM = "FORM",
}

export interface _Tag {
  uuid?: string,
  name: string,
  space_uuid: string, 
  category_uuid: string,
  json_data: {
    mp_data: MpSdk.Tag.TagData,
    media?: MpSdk.Tag.Attachment,
    // other future props
  };
}

export interface TagPlacerInter {
  tagDataId: string,
  anchorPosition: Vector3,
  stemVector: Vector3,
  stemScalar: number,

  moveTag(): void,
}

export interface CategoryForm {
  action: string,
  tag_category: Category
}

// Commented this one since SubCategory is deprecated 
// export interface SubCategoryForm {
//   action: string,
//   tag_subcategory: SubCategory
// }

export interface RoleForm {
  action: string,
  role: Role
}

export const enum OBJECT_TYPE {
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  MP4 = "mp4",
  PDF = "pdf",
  GIF = "gif",
  BMP = "bmp",
}

export interface Node {
  id?: string,
  parent?: string,
  folder_uuid: string,
  parent_uuid: string,
  owner_uuid: string,
  text: string,
  name: string,
  children?: Array<string>,
  type_: FOLDER_TYPE,
  // created_on: string,
  data?: Section | Facility | Space,
  users?: Array<FolderUser>,
  categories?: Array<Category>,
  roles?: Array<Role>
  state?: {
    opened: boolean,
  };
}

export interface Nodes {
  [key: string]: Node,
}

export interface TagColor {
  name: COLOR,
  rgb: { r: number; g: number; b: number }
}

export const enum COLOR {
  MAROON = "MAROON",
  RED = "RED",
  ORANGE = "ORANGE",
  YELLOW = "YELLOW",
  YELLOW_GREEN = "YELLOW GREEN",
  GREEN = "GREEN",
  LIGHT_BLUE = "LIGHT BLUE",
  BLUE = "BLUE",
  DARK_BLUE = "DARK BLUE",
  PURPLE = "PURPLE",
}

export const enum ACTION_BAR {
  ADD_SECTION = "addSection",
  ADD_FACILITY = "addFacility",
  ADD_SPACE = "addSpace",
  EDIT_SECTION = "editSection",
  EDIT_FACILITY = "editFacility",
  EDIT_SPACE = "editSpace",
  SECTION_SETTING = "showSectionSetting",
  FACILITY_SETTING = "showFacilitySetting",
}

export interface EmbedlyData {
  author_name: string,
  author_url: string,
  height: number,
  html: string,
  provider_name: string,
  provider_url: string,
  thumbnail_height: number,
  thumbnail_url: string,
  thumbnail_width: number,
  title: string,
  type: string,
  url: string,
  version: string,
  width: number
}

export interface Activity {
  space_uuid: string,
  created_on: string,
  type: ACTIVITY_TYPE,
}

// export interface IAuth{
//   expiration: number,
//   hmac_key: string,
//   last_visit: string,
//   user: User,
//   user_groups: any,
//   ticket: string
// }

export interface ISession{
  auth: {
    expiration: number,
    hmac_key: string,
    last_visit: string,
    user: User,
    user_groups: any
  },
  ticket: string 
}

export const enum ACTIVITY_TYPE {
  LANDING = "LANDING",
  TAG_CLICK = "TAGCLICK",
}

export const enum USER_GROUP {
  Admin = "Admin",
  Manager = "Manager",
  User = "User",
}
export interface AlertModalDetail {
  message: string,
  theme: THEME,
  can_confirm: Boolean,
  action?: Function
}

export const enum THEME {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger"
}