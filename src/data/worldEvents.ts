import type { WorldEvent } from '../types';

export const possibleWorldEvents: Omit<WorldEvent, 'id' | 'timestamp'>[] = [
  {
    description: "Military patrol spotted in the downtown district",
    impact: 'neutral',
    affectedFactions: ['military'],
  },
  {
    description: "Survivor camp established at the old hospital",
    impact: 'positive',
    affectedFactions: ['survivors'],
  },
  {
    description: "Unknown signal detected broadcasting from the tower",
    impact: 'negative',
    affectedFactions: ['unknown'],
  },
  {
    description: "Food supplies running critically low across the city",
    impact: 'negative',
    affectedFactions: ['survivors'],
  },
  {
    description: "Military enforcing strict quarantine zones",
    impact: 'negative',
    affectedFactions: ['military', 'survivors'],
  },
  {
    description: "Strange lights reported near the industrial district",
    impact: 'negative',
    affectedFactions: ['unknown'],
  },
  {
    description: "Survivor group successfully rescued children from school",
    impact: 'positive',
    affectedFactions: ['survivors'],
  },
  {
    description: "Military losing control of eastern sectors",
    impact: 'negative',
    affectedFactions: ['military'],
  },
  {
    description: "Radio silence from neighboring cities",
    impact: 'negative',
    affectedFactions: ['survivors', 'military'],
  },
  {
    description: "Hope spreads as more survivors organize",
    impact: 'positive',
    affectedFactions: ['survivors'],
  },
];

export const generateWorldEvent = (factions: string[]): WorldEvent => {
  const filteredEvents = possibleWorldEvents.filter(event => 
    event.affectedFactions.some(faction => factions.includes(faction))
  );
  
  const selectedEvent = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
  
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...selectedEvent,
    timestamp: Date.now(),
  };
};
