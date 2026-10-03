import { Scene, ConflictItem } from '../types/storyboard';

export class PromptConflictAnalyzer {
  /**
   * Scans individual scenes and overall prompt text for contradictory directives
   */
  public static detectConflicts(scenes: Scene[]): ConflictItem[] {
    const conflicts: ConflictItem[] = [];

    scenes.forEach((scene) => {
      const fullText = `${scene.title} ${scene.visual} ${scene.action} ${scene.camera} ${scene.effects}`.toLowerCase();
      const cameraText = scene.camera.toLowerCase();
      const actionText = scene.action.toLowerCase();
      const effectText = scene.effects.toLowerCase();

      // Conflict 1: Fast movement vs Slow Motion
      const hasFast = (
        actionText.includes('fast') ||
        actionText.includes('rapid') ||
        actionText.includes('sprint') ||
        actionText.includes('speed') ||
        actionText.includes('rush') ||
        effectText.includes('motion blur')
      );
      const hasSlowMo = (
        actionText.includes('slow motion') ||
        effectText.includes('slow motion') ||
        effectText.includes('slow-mo') ||
        fullText.includes('bullet time')
      );

      if (hasFast && hasSlowMo && !fullText.includes('ramping')) {
        conflicts.push({
          id: `conflict-fast-slow-${scene.scene}`,
          sceneNumber: scene.scene,
          type: 'motion',
          description: `Scene ${scene.scene} memuat instruksi yang bertolak belakang: gerakan cepat sekaligus gerakan lambat (slow motion).`,
          conflictA: 'Fast / rapid movement',
          conflictB: 'Slow motion',
          suggestedFix: 'Ubah menjadi "Speed ramping from rapid sprint into micro slow-motion impact".'
        });
      }

      // Conflict 2: Fixed Camera vs Rapid Tracking / Pan
      const hasFixedCam = (
        cameraText.includes('fixed camera') ||
        cameraText.includes('static camera') ||
        cameraText.includes('locked-off') ||
        cameraText.includes('tripod')
      );
      const hasMovingCam = (
        cameraText.includes('rapidly tracks') ||
        cameraText.includes('rapid tracking') ||
        cameraText.includes('whip pan') ||
        cameraText.includes('dolly shot') ||
        cameraText.includes('chase cam')
      );

      if (hasFixedCam && hasMovingCam) {
        conflicts.push({
          id: `conflict-cam-fixed-moving-${scene.scene}`,
          sceneNumber: scene.scene,
          type: 'camera',
          description: `Scene ${scene.scene} memuat instruksi kamera berlawanan: Kamera diam (static/fixed) tapi juga tracking cepat.`,
          conflictA: 'Static / Fixed camera',
          conflictB: 'Rapid tracking / Dolly',
          suggestedFix: 'Pilih "Dynamic low-angle tracking shot with stable gimbal balance".'
        });
      }

      // Conflict 3: Standing Still vs Running / Charging
      const hasStill = (
        actionText.includes('standing still') ||
        actionText.includes('motionless') ||
        actionText.includes('frozen in place')
      );
      const hasRunning = (
        actionText.includes('running forward') ||
        actionText.includes('charges forward') ||
        actionText.includes('dashes forward')
      );

      if (hasStill && hasRunning) {
        conflicts.push({
          id: `conflict-action-still-run-${scene.scene}`,
          sceneNumber: scene.scene,
          type: 'physics',
          description: `Scene ${scene.scene} memerintahkan karakter diam di tempat sekaligus berlari maju.`,
          conflictA: 'Standing still / motionless',
          conflictB: 'Running / charging forward',
          suggestedFix: 'Perjelas transisi: "Karakter diam sesaat dalam kuda-kuda, lalu melesat maju eksplosif".'
        });
      }

      // Conflict 4: Single Character vs Two Characters
      const visualLower = scene.visual.toLowerCase();
      const hasSingle = visualLower.includes('single character') || visualLower.includes('alone in frame') || visualLower.includes('solo fighter');
      const hasTwo = visualLower.includes('two characters') || visualLower.includes('fighter a and fighter b') || visualLower.includes('both fighters');

      if (hasSingle && hasTwo) {
        conflicts.push({
          id: `conflict-chars-${scene.scene}`,
          sceneNumber: scene.scene,
          type: 'character',
          description: `Scene ${scene.scene} menyebutkan karakter tunggal (solo) sekaligus dua karakter dalam frame yang sama.`,
          conflictA: 'Single character solo',
          conflictB: 'Two characters / duelists',
          suggestedFix: 'Gunakan: "Two combatants in frame, with focus tightly centered on the protagonist".'
        });
      }
    });

    return conflicts;
  }

  /**
   * Automatically resolves identified conflicts by updating the scene texts
   */
  public static autoFixConflicts(scenes: Scene[], conflicts: ConflictItem[]): Scene[] {
    const updatedScenes = [...scenes];

    conflicts.forEach((conflict) => {
      if (!conflict.sceneNumber) return;
      const idx = updatedScenes.findIndex(s => s.scene === conflict.sceneNumber);
      if (idx === -1) return;

      const target = { ...updatedScenes[idx] };

      if (conflict.type === 'motion') {
        // Resolve fast vs slow mo
        target.action = target.action.replace(/slow motion|slow-mo/gi, 'kinetic high-velocity speed ramping');
        target.effects = target.effects.replace(/slow motion|slow-mo/gi, 'subtle micro-impact deceleration');
      } else if (conflict.type === 'camera') {
        // Resolve fixed vs moving
        target.camera = 'Dynamic fluid tracking gimbal camera maintaining stable focus';
      } else if (conflict.type === 'physics') {
        // Resolve still vs running
        target.action = 'Coiled tension breaks immediately into explosive forward acceleration';
      } else if (conflict.type === 'character') {
        // Resolve single vs two
        target.visual = target.visual.replace(/single character|alone in frame|solo fighter/gi, 'primary combatant in foreground facing opponent');
      }

      updatedScenes[idx] = target;
    });

    return updatedScenes;
  }
}
