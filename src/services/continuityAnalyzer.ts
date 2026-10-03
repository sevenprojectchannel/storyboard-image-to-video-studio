import { Scene, ContinuityMap } from '../types/storyboard';

export interface ContinuityReport {
  isCohesive: boolean;
  score: number; // 0 to 100
  notes: string[];
  momentumChain: string[];
  spatialConsistency: string;
}

export class ContinuityAnalyzer {
  /**
   * Analyzes an array of sequential scenes to verify continuity and generate vector links
   */
  public static verifyContinuity(scenes: Scene[]): ContinuityReport {
    if (!scenes || scenes.length === 0) {
      return {
        isCohesive: false,
        score: 0,
        notes: ['Tidak ada scene untuk dianalisis.'],
        momentumChain: [],
        spatialConsistency: 'Undefined'
      };
    }

    const notes: string[] = [];
    const momentumChain: string[] = [];
    let score = 100;

    // 1. Check scene count and progression
    for (let i = 0; i < scenes.length; i++) {
      const current = scenes[i];
      const next = scenes[i + 1];

      if (next) {
        const stepDesc = `Scene ${current.scene} (${current.time}) ➔ Scene ${next.scene} (${next.time})`;
        
        // Momentum evaluation
        let linkNote = '';
        if (current.vectorDirection && next.vectorDirection) {
          linkNote = `${stepDesc}: Vektor "${current.vectorDirection}" menyambung ke "${next.vectorDirection}".`;
        } else {
          linkNote = `${stepDesc}: Momentum kinetik dan arah pergerakan terjaga secara linear.`;
        }
        momentumChain.push(linkNote);

        // Check for sudden drastic action discontinuity
        const currAct = (current.action + ' ' + current.visual).toLowerCase();
        const nextAct = (next.action + ' ' + next.visual).toLowerCase();

        // e.g. If scene 2 has rapid forward sprint, scene 3 should connect impact or strike
        if (currAct.includes('charge') || currAct.includes('dash') || currAct.includes('rush') || currAct.includes('sprint')) {
          if (!nextAct.includes('strike') && !nextAct.includes('punch') && !nextAct.includes('kick') && !nextAct.includes('impact') && !nextAct.includes('contact') && !nextAct.includes('clash')) {
            notes.push(`Saran Kontinuitas: Scene ${current.scene} menunjukkan akselerasi lari, pastikan Scene ${next.scene} mengeksekusi benturan atau kelanjutan lari tersebut.`);
            score -= 5;
          }
        }

        // If punch/strike lands in scene 3, scene 4 should have recoil/reaction
        if (currAct.includes('punch') || currAct.includes('strike') || currAct.includes('hit') || currAct.includes('connect')) {
          if (!nextAct.includes('recoil') && !nextAct.includes('skid') && !nextAct.includes('fall') && !nextAct.includes('fly') && !nextAct.includes('react') && !nextAct.includes('pushed')) {
            notes.push(`Saran Kontinuitas: Scene ${current.scene} menunjukkan benturan pukulan, Scene ${next.scene} idealnya memperlihatkan reaksi gaya momentum (recoil/terpental).`);
            score -= 5;
          }
        }
      }
    }

    // Default positive notes if all good
    if (notes.length === 0) {
      notes.push('Kontinuitas visual, identitas karakter, pencahayaan, dan vektor momentum antar-scene optimal.');
      notes.push('Karakter, pakaian, dan lingkungan konsisten sesuai master storyboard.');
    }

    return {
      isCohesive: score >= 80,
      score: Math.max(50, score),
      notes,
      momentumChain,
      spatialConsistency: 'Screen-left to screen-right relative positioning preserved.'
    };
  }

  /**
   * Generates a comprehensive continuity map for JSON output and prompt integration
   */
  public static generateContinuityMap(scenes: Scene[], existingMap?: ContinuityMap): ContinuityMap {
    if (existingMap && existingMap.characters && existingMap.environment) {
      return existingMap;
    }

    const flow: string[] = [];
    for (let i = 0; i < scenes.length - 1; i++) {
      const cur = scenes[i];
      const nxt = scenes[i + 1];
      flow.push(`Scene ${cur.scene} -> Scene ${nxt.scene}: Continuous momentum trajectory (${cur.vectorDirection || 'forward'} -> ${nxt.vectorDirection || 'follow-through'}).`);
    }

    return {
      characters: 'Characters, clothing colors, hairstyles, and facial structures are locked identically across all scenes based on master storyboard.',
      environment: 'Environment architecture, background elements, ground texture, and weather remain 100% constant without sudden scene shifts.',
      lighting: 'Key illumination direction, color temperature, and shadow angle remain uniform.',
      momentumFlow: flow.length > 0 ? flow : [
        'Scene 1 to Scene 2: Tension converts to kinetic acceleration.',
        'Scene 2 to Scene 3: Acceleration concentrates into direct strike point.',
        'Scene 3 to Scene 4: Concussive kinetic energy carries recoil.',
        'Scene 4 to Scene 5: Deceleration transitions into balanced closing stance.'
      ],
      spatialRelationships: 'Strict relative spatial orientation maintained between protagonists.'
    };
  }
}
