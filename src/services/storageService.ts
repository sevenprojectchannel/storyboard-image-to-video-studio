import { StudioProject } from '../types/storyboard';

const STORAGE_PROJECT_KEY = 'storyboard_studio_saved_project';
const STORAGE_PROJECT_LIST_KEY = 'storyboard_studio_saved_projects_list';

export class StorageService {
  /**
   * Save current project to localStorage
   */
  public static saveProjectLocally(project: StudioProject): boolean {
    try {
      const serialized = JSON.stringify(project);
      localStorage.setItem(STORAGE_PROJECT_KEY, serialized);
      
      // Update quick list metadata
      const listStr = localStorage.getItem(STORAGE_PROJECT_LIST_KEY);
      let list: Array<{ id: string; title: string; updatedAt: string; sceneCount: number }> = [];
      if (listStr) {
        try {
          list = JSON.parse(listStr);
        } catch {
          list = [];
        }
      }

      const existingIndex = list.findIndex(item => item.id === project.id);
      const meta = {
        id: project.id,
        title: project.title,
        updatedAt: new Date().toISOString(),
        sceneCount: project.scenes.length
      };

      if (existingIndex >= 0) {
        list[existingIndex] = meta;
      } else {
        list.unshift(meta);
      }

      localStorage.setItem(STORAGE_PROJECT_LIST_KEY, JSON.stringify(list.slice(0, 10)));
      return true;
    } catch (err: any) {
      console.warn('LocalStorage save failed, probably quota exceeded for large images:', err.message);
      // If error is quota exceeded due to large image, try saving without heavy image payload
      try {
        const leanProject = {
          ...project,
          storyboardImageMeta: {
            ...project.storyboardImageMeta,
            dataUrl: '' // Strip large base64 to preserve scene data
          }
        };
        localStorage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(leanProject));
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Load current saved project from localStorage
   */
  public static loadProjectLocally(): StudioProject | null {
    try {
      const data = localStorage.getItem(STORAGE_PROJECT_KEY);
      if (!data) return null;
      return JSON.parse(data) as StudioProject;
    } catch {
      return null;
    }
  }

  /**
   * Export project to downloadable .json file
   */
  public static exportProjectToFile(project: StudioProject): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `storyboard-studio-project-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Download JSON output as specified in Section 18
   */
  public static downloadJson(jsonString: string, filename: string = 'image-to-video-storyboard-10s.json'): void {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /**
   * Download master human prompt as .txt as specified in Section 18
   */
  public static downloadPromptTxt(promptString: string, filename: string = 'image-to-video-storyboard-10s.txt'): void {
    const blob = new Blob([promptString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /**
   * Copy to clipboard using modern Clipboard API with fallback
   */
  public static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        return successful;
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      return false;
    }
  }
}
