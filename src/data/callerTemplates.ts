import type { Caller } from '../types';

export const callerArchetypes = {
  desperate_parent: {
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel
    emotionalStates: ['pleading', 'desperate', 'crying', 'hopeful'],
    motivations: ['find children', 'get medicine', 'safety for family'],
    secrets: ['already infected', 'not really parent', 'abandoned others'],
  },
  wounded_soldier: {
    voiceId: "VR6AewLTigWG4xSOukaG", // Arnold
    emotionalStates: ['pained', 'determined', 'resigned', 'angry'],
    motivations: ['report intel', 'warn of danger', 'request extraction'],
    secrets: ['deserted post', 'responsible for deaths', 'not really military'],
  },
  scared_kid: {
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah
    emotionalStates: ['terrified', 'crying', 'confused', 'brave'],
    motivations: ['find parents', 'get help', 'understand what happened'],
    secrets: ['witnessed something horrible', 'not telling whole truth', 'alone but says with others'],
  },
  cunning_liar: {
    voiceId: "AZnzlk1XvdvUeBnXmlld", // Domi
    emotionalStates: ['charming', 'manipulative', 'nervous', 'aggressive'],
    motivations: ['gain trust', 'exploit resources', 'spread misinformation'],
    secrets: ['working with enemy', 'hoarding supplies', 'killing survivors'],
  },
  true_believer: {
    voiceId: "ErXwobaYiN019PkySvjV", // Antoni
    emotionalStates: ['fanatical', 'calm', 'prophetic', 'menacing'],
    motivations: ['spread ideology', 'recruit followers', 'fulfill prophecy'],
    secrets: ['delusional', 'cult leader', 'planning mass suicide'],
  },
  government_agent: {
    voiceId: "AZnzlk1XvdvUeBnXmlld", // Domi
    emotionalStates: ['official', 'evasive', 'authoritative', 'threatening'],
    motivations: ['maintain order', 'contain information', 'control population'],
    secrets: ['government collapsed', 'covering up truth', 'abandoned protocol'],
  },
  the_watcher: {
    voiceId: "ErXwobaYiN019PkySvjV", // Antoni
    emotionalStates: ['knowing', 'unsettling', 'judgmental', 'omnipresent'],
    motivations: ['observe', 'judge', 'reveal truth', 'play mind games'],
    secrets: ['been listening all along', 'knows player choices', 'not human'],
  },
};

export const generateCallerFromArchetype = (
  archetype: keyof typeof callerArchetypes,
  round: number,
  worldState: any
): Partial<Caller> => {
  const template = callerArchetypes[archetype];
  const emotionalState = template.emotionalStates[Math.floor(Math.random() * template.emotionalStates.length)];
  const motivation = template.motivations[Math.floor(Math.random() * template.motivations.length)];
  const secret = template.secrets[Math.floor(Math.random() * template.secrets.length)];
  
  return {
    archetype,
    voiceId: template.voiceId,
    emotionalState,
    motivation,
    secret,
    trustworthiness: archetype === 'cunning_liar' ? 0.2 : archetype === 'the_watcher' ? 0.5 : 0.7,
    isLying: archetype === 'cunning_liar' || Math.random() > 0.6,
  };
};
