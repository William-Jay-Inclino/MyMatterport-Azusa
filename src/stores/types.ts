import type { MpSdk, Vector3 } from '../../public/bundle/sdk'

export interface User {
  uuid: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  company_name: string;
  email: string;
  mobile: string;
  city: string;
  password: string;
  roles: Array<Role>;
}

export interface SpaceUnit{ 
  type: SPACE_UNIT_TYPE,
  uuid: string,
  parent_uuid?: string,
  created_on: string, // rename to created_on
  name: string,
  children?: Array<SpaceUnit>,
  data?: Section | Facility | Space,
  users?: Array<SpaceUnitUser>
}

export const enum SPACE_UNIT_TYPE{ 
  ROOT = 'Root',
  SECTION = 'Section',
  FACILITY = 'Facility',
  SPACE = 'Space'
}

export interface Section{
  belonging_club: string,
  roles?: Array<Role>,
  categories?: Array<Category>, 
  //other props for section
}

export interface Facility{
  belonging_club: string,
  roles?: Array<Role>,
  categories?: Array<Category>
  users: Array<User>
  //other props for facility
}

export interface Space{
  model_sid: string,
  space_image?: string,
  showcase_url: string,
  //other props for space
}

export interface SpaceUnitUser {
  uuid: string,
  name: string,
  email: string,
  owner?: string,
  roles: Array<Role>
}

export interface Role {
  uuid: string,
  color: TagColor,
  name: string,
  categories: Array<Category>
}

export interface Category{ 
  uuid: string,
  name: string,
  color: TagColor,
  sub_category: Array<SubCategory>
}

export interface SubCategory{ 
  uuid: string,
  name: string,
  icon?: string,
  color: string
}

export const enum TABLE_VIEW{
  LIST = 'LIST',
  CARD = 'CARD'
}

export const enum SPACE3D_SIDEBAR_VIEW{
  LIST = 'LIST',
  FORM = 'FORM'
}

export interface _Tag{
  uuid: string, 
  parent_uuid: string, // rename to parent_uuid
  data: {
    mp_data: MpSdk.Tag.TagData,
    category: Category | null,
    subcategory: SubCategory | null,
    media?: MpSdk.Tag.Attachment
    // other future props
  }
}

export interface TagPlacerInter {
  tagDataId: string
  anchorPosition: Vector3
  stemVector: Vector3
  stemScalar: number

  moveTag(): void
}

export interface CategoryForm{
  action: string,
  tag_category: Category
}

export interface SubCategoryForm{
  action: string,
  tag_subcategory: SubCategory
}

export interface RoleForm{
  action: string,
  role: Role
}

export const enum OBJECT_TYPE{
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  MP4 = 'mp4',
  PDF = 'pdf',
  GIF = 'gif',
  BMP = 'bmp'
}

export interface Node{
  id?: string,
  parent?: string,
  text: string,
  children?: Array<string>,
  type: SPACE_UNIT_TYPE,
  created_on: string,
  data?: Section | Facility | Space,
  users?: Array<SpaceUnitUser>
  state?: {
      opened: boolean
  }
}

export interface Nodes {
  [key: string]: Node
}

export interface TagColor{
  name: COLOR,
  rgb: {r: number, g: number, b: number}
}

export const enum COLOR{
  MAROON = 'MAROON',
  RED = 'RED',
  ORANGE = 'ORANGE',
  YELLOW = 'YELLOW',
  YELLOW_GREEN = 'YELLOW GREEN',
  GREEN = 'GREEN',
  LIGHT_BLUE = 'LIGHT BLUE',
  BLUE = 'BLUE',
  DARK_BLUE = 'DARK BLUE',
  PURPLE = 'PURPLE',
}

export const enum ACTION_BAR{
  ADD_SECTION = 'addSection',
  ADD_FACILITY = 'addFacility',
  ADD_SPACE = 'addSpace',
  SECTION_SETTING = 'showSectionSetting',
  FACILITY_SETTING = 'showFacilitySetting'
}

export interface EmbedlyData{
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