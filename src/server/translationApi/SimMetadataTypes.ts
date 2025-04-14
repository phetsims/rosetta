// Copyright 2025, University of Colorado Boulder

/**
 * Data types for working with the PhET simulation metadata.
 *
 * TODO: See https://github.com/phetsims/rosetta/issues/452.  The types defined herein should eventually be replaced
 *       with types shared with the website code.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { simLocalesUntyped } from './simLocalesUntyped.js';

export const SIM_TYPE_JAVA = 'java';
export const SIM_TYPE_FLASH = 'flash';
export const SIM_TYPE_HTML = 'html';
export const SIM_TYPE_INT_JAVA = 0;
export const SIM_TYPE_INT_FLASH = 1;
export const SIM_TYPE_INT_HTML = 2;

export type BasicCodebaseIntegerType = typeof SIM_TYPE_INT_JAVA | typeof SIM_TYPE_INT_FLASH | typeof SIM_TYPE_INT_HTML;

// grade levels
export const GRADE_LEVEL_ELEMENTARY_SCHOOL = 0;
export const GRADE_LEVEL_MIDDLE_SCHOOL = 1;
export const GRADE_LEVEL_HIGH_SCHOOL = 2;
export const GRADE_LEVEL_UNIVERSITY = 3;

export type GradeLevelIntegerType =
  typeof GRADE_LEVEL_ELEMENTARY_SCHOOL |
  typeof GRADE_LEVEL_MIDDLE_SCHOOL |
  typeof GRADE_LEVEL_HIGH_SCHOOL |
  typeof GRADE_LEVEL_UNIVERSITY;

// subjects
export const SUBJECT_PHYSICS = 4;
export const SUBJECT_MOTION = 5;
export const SUBJECT_SOUND_AND_WAVES = 6;
export const SUBJECT_WORK_ENERGY_AND_POWER = 7;
export const SUBJECT_HEAT_AND_THERMODYNAMICS = 8;
export const SUBJECT_QUANTUM_PHENOMENA = 9;
export const SUBJECT_LIGHT_AND_RADIATION = 10;
export const SUBJECT_ELECTRICITY_MAGNETS_AND_CIRCUITS = 11;
export const SUBJECT_BIOLOGY = 12;
export const SUBJECT_CHEMISTRY = 13;
export const SUBJECT_EARTH_AND_SPACE = 14;
export const SUBJECT_MATH_AND_STATISTICS = 15;
export const SUBJECT_GENERAL = 19;
export const SUBJECT_QUANTUM = 20;
export const SUBJECT_MATHCONCEPTS = 30;
export const SUBJECT_MATHAPPLICATIONS = 31;

export type SubjectIntegerType =
  typeof SUBJECT_PHYSICS |
  typeof SUBJECT_MOTION |
  typeof SUBJECT_SOUND_AND_WAVES |
  typeof SUBJECT_WORK_ENERGY_AND_POWER |
  typeof SUBJECT_HEAT_AND_THERMODYNAMICS |
  typeof SUBJECT_QUANTUM_PHENOMENA |
  typeof SUBJECT_LIGHT_AND_RADIATION |
  typeof SUBJECT_ELECTRICITY_MAGNETS_AND_CIRCUITS |
  typeof SUBJECT_BIOLOGY |
  typeof SUBJECT_CHEMISTRY |
  typeof SUBJECT_EARTH_AND_SPACE |
  typeof SUBJECT_MATH_AND_STATISTICS |
  typeof SUBJECT_GENERAL |
  typeof SUBJECT_QUANTUM |
  typeof SUBJECT_MATHCONCEPTS |
  typeof SUBJECT_MATHAPPLICATIONS;

// inclusive features
export const A11Y_TYPE_ACCESSIBILITY = 0;
export const A11Y_TYPE_ALTERNATIVE_INPUT = 1;
export const A11Y_TYPE_SOUND_AND_SONIFICATION = 2;
export const A11Y_TYPE_INTERACTIVE_DESCRIPTION = 3;
export const A11Y_TYPE_INTERACTIVE_DESCRIPTION_IOS = 4;
export const A11Y_TYPE_ZOOM_AND_MAGNIFICATION = 5;
export const A11Y_TYPE_VOICING = 6;
export const A11Y_TYPE_INTERACTIVE_HIGHLIGHTS = 7;
export const A11Y_TYPE_CAMERA_INPUT = 8;
export const A11Y_TYPE_CUSTOM_GESTURE = 9;

export type A11yFeatureIntegerType =
  typeof A11Y_TYPE_ACCESSIBILITY |
  typeof A11Y_TYPE_ALTERNATIVE_INPUT |
  typeof A11Y_TYPE_SOUND_AND_SONIFICATION |
  typeof A11Y_TYPE_INTERACTIVE_DESCRIPTION |
  typeof A11Y_TYPE_INTERACTIVE_DESCRIPTION_IOS |
  typeof A11Y_TYPE_ZOOM_AND_MAGNIFICATION |
  typeof A11Y_TYPE_VOICING |
  typeof A11Y_TYPE_INTERACTIVE_HIGHLIGHTS |
  typeof A11Y_TYPE_CAMERA_INPUT |
  typeof A11Y_TYPE_CUSTOM_GESTURE;

export type LocaleType = keyof typeof simLocalesUntyped;

export type LocalizedSimulationType = {
  teachersGuide: string;
  videoUrl: string;
  sonificationVideoUrl: string;
  descriptionVideoUrl: string;
  runUrl: string;
  description: string;
  simPageUrl: string;
  id: number;
  learningGoals: string;
  title: string;
  isCheerpj: boolean;
  downloadUrl: string;
  hasPrototype?: boolean;
  prototypeRunUrl?: string;
};

export type SimulationType = {
  altImageCount: number;
  highGradeLevel: GradeLevelIntegerType;
  designTeam: string;
  lreTerms: number[];
  subjects: SubjectIntegerType[];
  allLocalesSimURL: string;
  libraries: string;
  isNew: number;
  relatedSimulations: number[];
  keywordIds: number[];
  lowGradeLevel: GradeLevelIntegerType;
  alignmentIds: number[];
  scienceLiteracyMapKeys: string[];
  cheerpjVersion: string;
  licenseUrls: string[];
  secondaryAlignmentIds: number[];
  a11yFeatures: A11yFeatureIntegerType[];
  thanksTo: string;
  createTime: number;
  credits: {
    thanksTo: string;
    designTeam: string;
    libraries: string;
  };
  name: string;
  topicIds: number[];
  id: number;
  localizedSimulations: Record<LocaleType, LocalizedSimulationType>;
  hasPrototype?: boolean;
  isPrototype?: boolean;
  isCommunity?: boolean;
  legacyType: 'none' | 'java' | 'flash' | 'java,cheerpj' | 'flash,cheerpj';
  prototypeTime?: number;
  communityPublicationTime?: number;
};

// The metadata format for the sim version, distinct from the SimVersion class in perennial.
export type MetadataSimVersion = {
  string: string;
  major: number;
  minor: number;
  dev: number;
  timestamp: number;
};

export type ProjectType = {
  name: string;
  id: number;
  type: BasicCodebaseIntegerType;
  version: MetadataSimVersion;
  simulations: SimulationType[];
};

export type SimMetadata = {
  projects: ProjectType[];
};

export type SimPhetioMetadata = {
  versionMaintenance: number;
  name: string;
  active: boolean;
  versionMajor: number;
  versionMinor: number;
  versionSuffix: string;
  latest: boolean;
  timestamp: string;
};