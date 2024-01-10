export interface HierarChyInterface {
  Id: string;
  TechnicalName: string;
  Type: string;
  Children?: ChildrenEntity[] | null;
}
export interface ChildrenEntity {
  Id: string;
  TechnicalName: string;
  Type: string;
  Children?: ChildrenEntity1[] | null;
}
export interface ChildrenEntity1 {
  Id: string;
  TechnicalName: string;
  Type: string;
  Children?: ChildrenEntity2[] | null;
}
export interface ChildrenEntity2 {
  Id: string;
  TechnicalName: string;
  Type: string;
  Children?: ChildrenEntity3[] | null;
}
export interface ChildrenEntity3 {
  Id: string;
  TechnicalName: string;
  Type: string;
}

export interface ScriptDialog {
  en: EnOrEs;
  es: EnOrEs;
  Context: string;
  key: string;
  id: string;
}
export interface EnOrEs {
  Text: string;
}

export interface DialogObject {
  es: string;
  en: string;
  name: string;
  template: DialogTemplateAnimation | undefined;
}

export interface DialogTemplateAnimation {
  animation: string;
  repeat: number;
  animationAfter: string;
  repeatAfter: number;
}

export interface Template {
  TechnicalName: string;
  DisplayName: string;
  Features?: FeaturesEntity[] | null;
}
export interface FeaturesEntity {
  TechnicalName: string;
  DisplayName: string;
  Properties?: PropertiesEntity[] | null;
  Constraints?: ConstraintsEntity[] | null;
}
export interface PropertiesEntity {
  Property: string;
  Type: string;
  DisplayName: string;
}
export interface ConstraintsEntity {
  Property: string;
  Type: string;
  IsLocalized?: string | null;
  SortMode?: string | null;
  MinValue?: string | null;
  MaxValue?: string | null;
  Precision?: string | null;
  MinPrecision?: string | null;
  MaxPrecision?: string | null;
  Unit?: null;
}

export interface Properties {
  TechnicalName: string;
  Type: string;
  Template: Template;
  Definition: Definition;
}

export interface Definition {
  Id: string;
  TechnicalName: string;
  Type: string;
  Properties: Properties;
}

export interface ObjectInterface {
  Type: string;
  Properties: PropertiesObject;
  Template: TemplateObject;
}
export interface PropertiesObject {
  TechnicalName: string;
  Id: string;
  Parent: string;
  MenuText: string;
  StageDirections: string;
  Speaker: string;
  SplitHeight: number;
  Color: Color;
  Text: string;
  ExternalId: string;
  Position: Position;
  ZIndex: number;
  Size: Size;
  ShortId: number;
  InputPins?: InputPinsEntity[] | null;
  OutputPins?: OutputPinsEntity[] | null;
}
export interface Color {
  r: number;
  g: number;
  b: number;
}
export interface Position {
  x: number;
  y: number;
}
export interface Size {
  w: number;
  h: number;
}
export interface InputPinsEntity {
  Text: string;
  Id: string;
  Owner: string;
}
export interface OutputPinsEntity {
  Text: string;
  Id: string;
  Owner: string;
  Connections?: ConnectionsEntity[] | null;
}
export interface ConnectionsEntity {
  Color: Color1;
  Label: string;
  TargetPin: string;
  Target: string;
}
export interface Color1 {
  a: number;
  r: number;
  g: number;
  b: number;
}
export interface TemplateObject {
  DialogLine: DialogLine;
}
export interface DialogLine {
  animation: number;
  repeat: number;
  animationAfter?: null;
  repeatAfter: number;
}

export interface ObjectDefinition {
  type: string;
  class: string;
  properties?: ObjectDefinitionProperty[];
  displayName?: string;
  values?: { [key: string]: number };
  displayNames?: DisplayNames;
  inheritsFrom?: string;
  template?: Template;
}

export interface DisplayNames {
  male?: string;
  female?: string;
  unknown?: string;
  idle?: string;
  talking?: string;
  yes?: string;
  no?: string;
  invalid?: string;
  spot?: string;
  circle?: string;
  rectangle?: string;
  path?: string;
  polygon?: string;
  link?: string;
  unselectable?: string;
  selectable?: string;
  invisible?: string;
  visible?: string;
  solid?: string;
  dot?: string;
  dash?: string;
  dashDot?: string;
  dashDotDot?: string;
  coloredDot?: string;
  none?: string;
  lineArrowHead?: string;
  filledArrowHead?: string;
  diamond?: string;
  square?: string;
  disc?: string;
  small?: string;
  medium?: string;
  large?: string;
  fromAsset?: string;
  custom?: string;
}

export interface ObjectDefinitionProperty {
  property: string;
  type: string;
  itemType?: string;
}
